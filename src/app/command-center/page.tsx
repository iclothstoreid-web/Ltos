import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OwnerCommandCenter } from '@/components/command-center/OwnerCommandCenter/OwnerCommandCenter'
import { getBottleneckSeverityByHours, QUEUE_WORKSPACE_URL } from '@/lib/ltos'
import type { BottleneckItem } from '@/components/command-center/OwnerCommandCenter/BottleneckPanel'
import type { AgendaItem } from '@/components/command-center/OwnerCommandCenter/AgendaPanel'

// OwnerCommandCenter itself is untouched in structure (chrome/layout unchanged)
// — this file only feeds it real data. /command-center previously rendered a
// separate, older page built against `queue_assignments` (0 rows), which is
// why every widget showed empty; that page was replaced by this one.
//
// The real Fitter workflow (Check-In -> ... -> Create Order) only ever
// advances orders.current_state as far as 'order' — Assign Artisan isn't
// wired yet. There is also no down-payment (DP), stock/material-inventory,
// or appointment-with-time model anywhere in the schema, so "Menunggu DP"
// and any fabric-stock bottleneck are honestly 0 / omitted rather than
// guessed at. Everything else below (revenue, quotation, QC, VIP, follow-up,
// production) reads real tables/columns that already exist.
export default async function CommandCenterPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1)

  const [
    { data: ordersAwaiting },
    { data: ordersInProduction },
    { data: ordersInQc },
    { data: ordersReady },
    { data: ordersInQuotation },
    { data: ordersInAppointment },
    { data: consultationsInReview },
    { data: artisans },
    { count: activeOrdersCount },
    { count: followUpTodayCount },
    { data: vipCustomers },
    { data: quotationsApprovedThisMonth },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'order')
      .order('created_at', { ascending: true }),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'production'),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'qc')
      .order('created_at', { ascending: true }),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'delivery'),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'quotation')
      .order('created_at', { ascending: true }),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'appointment'),
    supabase
      .from('consultations')
      .select('id, consultation_number, created_at, customers(name)')
      .eq('status', 'review')
      .order('created_at', { ascending: true }),
    supabase.from('profiles').select('id, name, role').eq('role', 'artisan'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .neq('current_state', 'follow_up'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('current_state', 'follow_up'),
    supabase.from('customers').select('id, name').eq('is_preferred_client', true),
    // Revenue source — quotations.status flips to 'approved' the first time
    // record_order_payment() is called (Sprint K Commercial Engine), and
    // .amount tracks the same post-discount/override total as .total (kept
    // in sync by recompute_quotation_total()). Sums are honestly 0 for any
    // month with no recorded payments yet, not a query bug.
    supabase
      .from('quotations')
      .select('amount, approved_at')
      .eq('status', 'approved')
      .gte('approved_at', monthStart.toISOString()),
  ])

  // Internal 8-stage production workflow now populates production_stage_records
  // (readable here via the staff RLS policy) — cutting/sewing are not
  // honestly empty, they reflect whichever orders are actively in that stage.
  const { data: activeStageRecords } = await supabase
    .from('production_stage_records')
    .select('order_id, stage, started_at, orders(order_number, customers(name))')
    .in('stage', ['cutting', 'sewing'])
    .eq('status', 'in_progress')

  // Low Stock notice (Cross Application Integration, LOCKED): Inventory is
  // now real (see src/lib/inventory) — materials at/under their Minimum
  // Stock feed the same Bottleneck Panel every other urgent item does,
  // always 'kritis' since a stock-out blocks production outright.
  const { data: materials } = await supabase
    .from('materials')
    .select('id, name, sku, unit, available_stock, min_stock, material_categories(name)')

  const lowStockMaterials = (materials || []).filter(m => m.available_stock <= m.min_stock)

  const [{ data: consultationsToday }, { count: fittingsToday }] = await Promise.all([
    supabase
      .from('consultations')
      .select('id, consultation_number, status, created_at, customers(name)')
      .gte('created_at', todayStart.toISOString()),
    supabase
      .from('business_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'measurement.completed')
      .gte('created_at', todayStart.toISOString()),
  ])

  const vipCustomerIds = (vipCustomers || []).map(c => c.id)
  const vipCustomerNameById = new Map((vipCustomers || []).map(c => [c.id, c.name]))
  const { data: vipOrdersWaiting } = vipCustomerIds.length
    ? await supabase
        .from('orders')
        .select('id, order_number, created_at, current_state, customer_id')
        .in('customer_id', vipCustomerIds)
        .not('current_state', 'in', '(delivery,follow_up)')
    : { data: [] as Array<{ id: string; order_number: string; created_at: string; current_state: string; customer_id: string }> }

  // Without a generated Database type, the untyped client infers embedded
  // to-one relations as an array here even though PostgREST returns a
  // single object at runtime for this FK — handling both shapes.
  type Named = {
    customers: { name: string } | { name: string }[] | null
    id: string
    created_at: string
  }
  const customerName = (row: Named) => {
    const c = Array.isArray(row.customers) ? row.customers[0] : row.customers
    return c?.name || 'Unknown'
  }

  // Same untyped-embed ambiguity as `Named` above, one level deeper:
  // production_stage_records -> orders -> customers.
  type StageRecordRow = {
    order_id: string
    stage: 'cutting' | 'sewing'
    started_at: string | null
    orders:
      | { order_number: string; customers: { name: string } | { name: string }[] | null }
      | { order_number: string; customers: { name: string } | { name: string }[] | null }[]
      | null
  }
  const stageRecordCard = (row: StageRecordRow) => {
    const order = Array.isArray(row.orders) ? row.orders[0] : row.orders
    const customers = order?.customers
    const c = Array.isArray(customers) ? customers[0] : customers
    return { id: row.order_id, order: order?.order_number || '—', customer: c?.name || 'Unknown' }
  }
  const cuttingOrders = (activeStageRecords || [])
    .filter(r => r.stage === 'cutting')
    .map(stageRecordCard)
  const sewingOrders = (activeStageRecords || [])
    .filter(r => r.stage === 'sewing')
    .map(stageRecordCard)

  const hoursWaiting = (createdAt: string) =>
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)

  const vipWorkspaceUrl = (state: string, orderId: string) => {
    const url = (QUEUE_WORKSPACE_URL as Record<string, string>)[state]
    return url ? `${url}/${orderId}` : `/workspace/order-created/${orderId}`
  }

  const bottleneckItems: BottleneckItem[] = [
    ...(ordersAwaiting || []).map(o => ({
      id: `assign-${o.id}`,
      orderId: o.id,
      severity: getBottleneckSeverityByHours(hoursWaiting(o.created_at)),
      customer: customerName(o),
      order: o.order_number,
      reason: 'Order dikonfirmasi, menunggu penugasan artisan',
      suggestedAction: 'Tugaskan Artisan',
      workspaceUrl: `/workspace/order-created/${o.id}`,
    })),
    ...(consultationsInReview || []).map(c => ({
      id: `review-${c.id}`,
      severity: getBottleneckSeverityByHours(hoursWaiting(c.created_at)),
      customer: customerName(c),
      order: c.consultation_number,
      reason: 'Konsultasi direview, order belum dibuat',
      suggestedAction: 'Review Konsultasi',
      workspaceUrl: `/workspace/consultation-review/${c.id}`,
    })),
    ...(ordersInQuotation || []).map(o => ({
      id: `quotation-${o.id}`,
      orderId: o.id,
      severity: getBottleneckSeverityByHours(hoursWaiting(o.created_at)),
      customer: customerName(o),
      order: o.order_number,
      reason: 'Quotation belum disetujui customer',
      suggestedAction: 'Review Quotation',
      workspaceUrl: `/workspace/quotation/${o.id}`,
    })),
    ...(ordersInQc || []).map(o => ({
      id: `qc-${o.id}`,
      orderId: o.id,
      severity: getBottleneckSeverityByHours(hoursWaiting(o.created_at)),
      customer: customerName(o),
      order: o.order_number,
      reason: 'QC menumpuk, order menunggu inspeksi',
      suggestedAction: 'Proses QC',
      workspaceUrl: `/workspace/qc/${o.id}`,
    })),
    ...(vipOrdersWaiting || []).map(o => ({
      id: `vip-${o.id}`,
      orderId: o.id,
      severity: getBottleneckSeverityByHours(hoursWaiting(o.created_at)),
      customer: vipCustomerNameById.get(o.customer_id) || 'Unknown',
      order: o.order_number,
      reason: 'Customer VIP menunggu, prioritaskan',
      suggestedAction: 'Lihat Order',
      workspaceUrl: vipWorkspaceUrl(o.current_state, o.id),
    })),
    ...lowStockMaterials.map(m => {
      const category = Array.isArray(m.material_categories) ? m.material_categories[0] : m.material_categories
      return {
        id: `stock-${m.id}`,
        severity: 'kritis' as const,
        customer: category?.name || 'Material',
        order: m.sku || '—',
        reason: `Stok ${m.name} di bawah ambang batas (${m.available_stock.toLocaleString('id-ID')} ${m.unit} tersisa)`,
        suggestedAction: 'Tinjau Stok',
        workspaceUrl: `/inventory/material?material=${m.id}`,
      }
    }),
  ]

  const ordersWaitingCount = ordersAwaiting?.length || 0
  const productionTodayCount = ordersInProduction?.length || 0
  const qcTodayCount = ordersInQc?.length || 0

  const revenueThisMonth = (quotationsApprovedThisMonth || []).reduce(
    (sum, q) => sum + (q.amount || 0),
    0
  )
  const revenueToday = (quotationsApprovedThisMonth || [])
    .filter(q => q.approved_at && new Date(q.approved_at) >= todayStart)
    .reduce((sum, q) => sum + (q.amount || 0), 0)

  const newLeadsCount = (consultationsToday || []).filter(c => c.status === 'check_in').length

  const executiveBrief =
    ordersWaitingCount > 0
      ? {
          recommendationTitle: `${ordersWaitingCount} order menunggu penugasan artisan`,
          recommendationBody: `Ada ${ordersWaitingCount} order yang sudah dikonfirmasi tetapi belum ditugaskan ke artisan. Assign artisan untuk melanjutkan ke tahap produksi.`,
        }
      : {
          recommendationTitle: 'Semua order berjalan sesuai jadwal',
          recommendationBody: 'Tidak ada order yang menunggu keputusan Anda saat ini.',
        }

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const agendaItems: AgendaItem[] = [
    ...(ordersInAppointment || []).map(o => ({
      id: `appt-${o.id}`,
      type: 'Janji Temu' as const,
      customer: customerName(o),
      label: `Order ${o.order_number}`,
    })),
    ...(consultationsToday || []).map(c => ({
      id: `consult-${c.id}`,
      type: 'Konsultasi' as const,
      customer: customerName(c),
      label: `Konsultasi ${c.consultation_number}`,
    })),
    ...(fittingsToday
      ? [
          {
            id: 'fitting-summary',
            type: 'Fitting' as const,
            customer: `${fittingsToday} sesi`,
            label: 'Pengukuran selesai hari ini',
          },
        ]
      : []),
    ...(ordersInQc || []).map(o => ({
      id: `review-${o.id}`,
      type: 'Review Produksi' as const,
      customer: customerName(o),
      label: `Order ${o.order_number} menunggu keputusan QC`,
    })),
    ...(ordersReady || []).map(o => ({
      id: `delivery-${o.id}`,
      type: 'Pengiriman' as const,
      customer: customerName(o),
      label: `Order ${o.order_number} siap dikirim`,
    })),
  ]

  return (
    <OwnerCommandCenter
      profileName={profile?.name || 'Pemilik'}
      todayLabel={todayLabel}
      summary={{
        revenueToday,
        revenueThisMonth,
        activeOrders: activeOrdersCount || 0,
        productionToday: productionTodayCount,
        qcToday: qcTodayCount,
      }}
      crmSnapshot={{
        newLeads: newLeadsCount,
        consultationsToday: consultationsToday?.length || 0,
        waitingQuotation: ordersInQuotation?.length || 0,
        // No down-payment tracking exists in the schema yet (no DP field or
        // state) — honestly 0 rather than guessed from an unrelated state.
        waitingDp: 0,
        followUpToday: followUpTodayCount || 0,
        vipCustomers: vipCustomers?.length || 0,
      }}
      bottleneckItems={bottleneckItems}
      executiveBrief={executiveBrief}
      productionColumns={{
        waiting: (ordersAwaiting || []).map(o => ({ id: o.id, order: o.order_number, customer: customerName(o) })),
        cutting: cuttingOrders,
        sewing: sewingOrders,
        qc: (ordersInQc || []).map(o => ({ id: o.id, order: o.order_number, customer: customerName(o) })),
        ready: (ordersReady || []).map(o => ({ id: o.id, order: o.order_number, customer: customerName(o) })),
      }}
      artisanCards={(artisans || []).map(a => ({
        id: a.id,
        name: a.name,
        role: a.role,
        workload: '—',
        capacity: '—',
        qualityScore: '—',
      }))}
      agendaItems={agendaItems}
    />
  )
}
