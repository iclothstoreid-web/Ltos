import type { SupabaseClient } from '@supabase/supabase-js'
import { COMMERCIAL_TYPES, requiresInvoice, type CommercialType } from './commercialType'

export interface CommercialTypeTransactionRow {
  transactionId: string
  transactionNumber: string
  orderId: string | null
  orderNumber: string | null
  customerName: string | null
  completed: boolean
}

export interface CommercialTypeSummaryRow {
  type: CommercialType
  label: string
  requiresInvoice: boolean
  transactionCount: number
  garmentCount: number
  completedGarmentCount: number
  // Sum of quotations.subtotal across every transaction of this type — the
  // real Design Studio price snapshot, same source Design Studio/Consultation
  // Review already display (buildDesignSpecification -> PriceSnapshot). Used
  // for both billable and non-billable types, since a KOL/Sponsor garment
  // still has a real catalog value even though nothing gets invoiced.
  estimatedValue: number
  // Actual collected/approved revenue (quotations.status='approved'). Only
  // meaningful for billable types — always 0 for KOL/Sponsor/Warranty/
  // Internal Sample, since record_order_payment() rejects payments against
  // them, so their quotation can never reach 'approved'. Never merged into
  // the dashboard's existing Revenue KPI (a separate, already-correct query)
  // — this is additive reporting only.
  revenue: number
  transactions: CommercialTypeTransactionRow[]
}

type TransactionRow = {
  id: string
  transaction_number: string
  commercial_type: CommercialType
  customers: { name: string | null } | { name: string | null }[] | null
  orders: { id: string; order_number: string }[] | { id: string; order_number: string } | null
  quotations: { subtotal: number | null; total: number | null; status: string }[] | { subtotal: number | null; total: number | null; status: string } | null
}

function first<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value
}

function asArray<T>(value: T | T[] | null): T[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

// Owner Dashboard "Commercial Summary" (Milestone A) — every existing
// transaction (Milestone A: still 1 order per transaction, since the
// multi-garment Fitter UI is Milestone B) grouped by Commercial Type. No new
// RPC: transactions/orders/quotations are already readable by any staff
// profile (see RLS policies in the transactions migration), same
// inline-Server-Component-query pattern getCommercialSummary() already uses.
export async function getCommercialTypeSummary(
  supabase: SupabaseClient,
  // Query Optimization (STEP 2, P1) — the Owner Dashboard (this function's
  // only caller) already fetches every production_stage_records row for its
  // own bottleneck panels. When it passes that result's shipping/completed
  // order-id set here, this function reuses it instead of re-querying the
  // same table. Falls back to its own scoped query when called without it,
  // so this function still works standalone.
  completedShippingOrderIds?: Set<string>
): Promise<CommercialTypeSummaryRow[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(
      `id, transaction_number, commercial_type,
       customers:primary_customer_id (name),
       orders (id, order_number),
       quotations (subtotal, total, status)`
    )
    .order('created_at', { ascending: false })

  if (error) throw error

  const rows = (data || []) as TransactionRow[]

  // Production completion signal: an order is "selesai" once its shipping
  // stage record is completed — same signal the Command Center's own
  // shippingReadyRecords/production columns already read from
  // production_stage_records, not a new concept.
  const allOrderIds = rows.flatMap(r => asArray(r.orders).map(o => o.id))
  let completedOrderIds: Set<string>
  if (completedShippingOrderIds) {
    completedOrderIds = completedShippingOrderIds
  } else {
    completedOrderIds = new Set<string>()
    if (allOrderIds.length > 0) {
      const { data: shippingRecords, error: shippingError } = await supabase
        .from('production_stage_records')
        .select('order_id')
        .eq('stage', 'shipping')
        .eq('status', 'completed')
        .in('order_id', allOrderIds)
      if (shippingError) throw shippingError
      for (const record of shippingRecords || []) completedOrderIds.add(record.order_id)
    }
  }

  const byType = new Map<CommercialType, CommercialTypeSummaryRow>()
  for (const option of COMMERCIAL_TYPES) {
    byType.set(option.value, {
      type: option.value,
      label: option.label,
      requiresInvoice: option.requiresInvoice,
      transactionCount: 0,
      garmentCount: 0,
      completedGarmentCount: 0,
      estimatedValue: 0,
      revenue: 0,
      transactions: [],
    })
  }

  for (const row of rows) {
    const summary = byType.get(row.commercial_type)
    if (!summary) continue

    const orders = asArray(row.orders)
    const quotation = first(row.quotations)
    const customer = first(row.customers)
    const order = orders[0] || null

    summary.transactionCount += 1
    summary.garmentCount += orders.length
    summary.completedGarmentCount += orders.filter(o => completedOrderIds.has(o.id)).length
    summary.estimatedValue += Number(quotation?.subtotal || 0)
    if (quotation?.status === 'approved') summary.revenue += Number(quotation.total || 0)

    summary.transactions.push({
      transactionId: row.id,
      transactionNumber: row.transaction_number,
      orderId: order?.id ?? null,
      orderNumber: order?.order_number ?? null,
      customerName: customer?.name ?? null,
      completed: order ? completedOrderIds.has(order.id) : false,
    })
  }

  return COMMERCIAL_TYPES.map(option => byType.get(option.value)!)
}

// Re-exported for convenience so callers don't need a second import for the
// one predicate the dashboard card needs alongside the summary rows.
export { requiresInvoice }
