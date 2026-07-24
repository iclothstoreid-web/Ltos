'use server'

import { createClient } from '@/lib/supabase/server'
import { STAGE_ORDER, STAGE_LABELS } from '@/lib/production/stageConfig'
import type {
  Customer,
  Consultation,
  RecentConsultation,
  CreateConsultationResult,
  CreateCustomerResult,
  SearchResult,
  ConsultationHistoryResult,
  RecentConsultationsResult,
  FitterOrder,
  FitterOrdersResult,
} from './types'

export async function searchCustomers(query: string): Promise<SearchResult> {
  const supabase = createClient()

  if (!query || query.length < 2) {
    return { customers: [], error: null }
  }

  const { data, error } = await supabase
    .from('customers')
    .select('id, name, phone, address, created_at, is_preferred_client')
    .or(
      `name.ilike.%${query}%,phone.ilike.%${query}%,address.ilike.%${query}%`
    )
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return { customers: [], error: error.message }
  }

  return { customers: (data || []) as Customer[], error: null }
}

export async function getCustomerById(customerId: string): Promise<{
  customer: Customer | null
  error: string | null
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('id, name, phone, address, created_at, is_preferred_client')
    .eq('id', customerId)
    .single()

  if (error) {
    return { customer: null, error: error.message }
  }

  return { customer: data as Customer, error: null }
}

export async function isReturningCustomer(customerId: string): Promise<{
  isReturning: boolean
  count: number
}> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)

  if (error) {
    return { isReturning: false, count: 0 }
  }

  return { isReturning: (count || 0) > 0, count: count || 0 }
}

export async function getConsultationHistory(
  customerId: string,
  limit: number = 5
): Promise<ConsultationHistoryResult> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('consultations')
    .select('id, consultation_number, status, notes, completed_at, created_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { consultations: [], error: error.message }
  }

  return { consultations: (data || []) as Consultation[], error: null }
}

export async function getRecentConsultations(
  limit: number = 5
): Promise<RecentConsultationsResult> {
  const supabase = createClient()

  // Unchanged query — ConsultationInsights also reads this action (with a
  // larger limit) to derive its "Order Selesai" stat from order_created
  // rows, so status filtering can't happen here. CustomerSearch filters
  // order_created out of its own "Konsultasi Terakhir" list client-side
  // instead (those now live in "Order Monitoring" as Order Cards).
  const { data, error } = await supabase
    .from('consultations')
    .select(
      `id, consultation_number, status, created_at,
       customers(id, name, phone)`
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { consultations: [], error: error.message }
  }

  return { consultations: (data || []) as unknown as RecentConsultation[], error: null }
}

// Every stage a given set of orders has recorded, in the shape
// get_current_stage_record's own algorithm needs — deliberately a lighter
// query than get_production_packet (no evidence/checklist/etc.) since the
// dashboard only needs the current stage label per order, for potentially
// many orders at once.
//
// Returns a category alongside the label (Task 2 / Order Card Polish) so
// the card can color-code the badge without re-parsing the Indonesian
// label string — derived from the same records already fetched here, no
// new query.
function resolveStatusProduksi(
  records: { stage: string; status: string; attempt: number }[]
): { label: string; category: 'waiting' | 'in_progress' | 'completed' } {
  if (records.length === 0) return { label: 'Menunggu Produksi', category: 'waiting' }
  for (const stage of STAGE_ORDER) {
    const forStage = records.filter(r => r.stage === stage)
    if (forStage.length === 0) return { label: 'Menunggu Produksi', category: 'waiting' }
    const latest = [...forStage].sort((a, b) => b.attempt - a.attempt)[0]
    if (latest.status !== 'completed') {
      return latest.status === 'in_progress'
        ? { label: STAGE_LABELS[stage], category: 'in_progress' }
        : { label: `${STAGE_LABELS[stage]} (Menunggu)`, category: 'waiting' }
    }
  }
  return { label: 'Produksi Selesai', category: 'completed' }
}

// Dashboard Fitter = Order Monitoring (Task 1 of the Fitter Order
// Monitoring & Shipping Experience sprint) — every order ever created,
// newest first, each carrying just enough to render an Order Card
// (Nama Customer, Order Number, Status Produksi, Estimasi, Tanggal Order).
// Reads `orders` + a batched `production_stage_records`/`business_events`
// query directly (same pattern as findOrderIdForConsultation/order-created's
// page.tsx) rather than calling get_production_packet once per order.
export async function getFitterOrders(limit: number = 10): Promise<FitterOrdersResult> {
  const supabase = createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, created_at, customers(name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { orders: [], error: error.message }
  }
  if (!orders || orders.length === 0) {
    return { orders: [], error: null }
  }

  const orderIds = orders.map(o => o.id)

  const [{ data: stageRecords }, { data: events }] = await Promise.all([
    supabase
      .from('production_stage_records')
      .select('order_id, stage, status, attempt')
      .in('order_id', orderIds),
    supabase
      .from('business_events')
      .select('order_id, event_data')
      .eq('event_type', 'order.created')
      .in('order_id', orderIds),
  ])

  const stagesByOrder = new Map<string, { stage: string; status: string; attempt: number }[]>()
  for (const record of stageRecords || []) {
    const list = stagesByOrder.get(record.order_id) ?? []
    list.push(record)
    stagesByOrder.set(record.order_id, list)
  }

  const estimasiByOrder = new Map<string, string>()
  for (const event of events || []) {
    const speed = (event.event_data as { designSpecification?: { estimatedProductionSpeed?: string } } | null)
      ?.designSpecification?.estimatedProductionSpeed
    if (speed) estimasiByOrder.set(event.order_id, speed)
  }

  const result: FitterOrder[] = orders.map(order => {
    const status = resolveStatusProduksi(stagesByOrder.get(order.id) ?? [])
    return {
      id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      customer_name: (order.customers as unknown as { name: string } | null)?.name ?? 'Pelanggan',
      status_produksi: status.label,
      status_category: status.category,
      estimasi: estimasiByOrder.get(order.id) ?? '',
    }
  })

  return { orders: result, error: null }
}

export async function createNewCustomer(
  name: string,
  phone: string,
  address?: string
): Promise<CreateCustomerResult> {
  const supabase = createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user?.id) {
    return { success: false, error: 'Belum terautentikasi. Silakan login kembali.', customer: null }
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      name,
      phone,
      address: address || null,
      created_by: user.data.user.id,
    })
    .select('id, name, phone, address, created_at, is_preferred_client')
    .single()

  if (error) {
    // Postgres unique violation code
    if (error.code === '23505') {
      return { success: false, error: 'Nomor HP sudah terdaftar.', customer: null }
    }
    return { success: false, error: error.message, customer: null }
  }

  return { success: true, error: null, customer: data as Customer }
}

export async function createConsultationSession(
  customerId: string,
  fitterId: string,
  notes?: string
): Promise<CreateConsultationResult> {
  const supabase = createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user?.id) {
    return {
      success: false,
      error: 'Belum terautentikasi. Silakan login kembali.',
      consultationId: null,
      consultationNumber: null,
    }
  }

  // consultation_number generated by DB via generate_consultation_number().
  // fitter_id ("Pilih fitter sebelum konsultasi", Sprint K) is who actually
  // ran the consultation for KPI purposes — kept separate from created_by
  // (the logged-in auth account) the same way Production keeps operator_id
  // separate from any login identity.
  const { data, error } = await supabase
    .from('consultations')
    .insert({
      customer_id: customerId,
      fitter_id: fitterId,
      notes: notes || '',
      status: 'check_in',
      created_by: user.data.user.id,
    })
    .select('id, consultation_number')
    .single()

  if (error) {
    return {
      success: false,
      error: error.message,
      consultationId: null,
      consultationNumber: null,
    }
  }

  return {
    success: true,
    error: null,
    consultationId: data.id,
    consultationNumber: data.consultation_number,
  }
}