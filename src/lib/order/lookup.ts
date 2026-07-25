import type { SupabaseClient } from '@supabase/supabase-js'

export interface OrderSearchResult {
  orderId: string
  orderNumber: string
  customerName: string
}

// Owner OS global search (OwnerTopBar) — order_number or customer name,
// case-insensitive substring match. Backed by search_orders_global (Sprint
// L), mirroring search_operators' existing RPC shape.
export async function searchOrdersGlobal(supabase: SupabaseClient, query: string): Promise<OrderSearchResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const { data, error } = await supabase.rpc('search_orders_global', { p_query: q })
  if (error) throw error

  return (data ?? []).map((row: { order_id: string; order_number: string; customer_name: string }) => ({
    orderId: row.order_id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
  }))
}

// `orders` has no consultation_id column (see createOrder.ts) — the link
// only exists on the `order.created` business_events row. Read-only lookup,
// no schema change: used to point a locked Fitter workspace page at the
// Order it already produced.
export async function findOrderIdForConsultation(
  supabase: SupabaseClient,
  consultationId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('business_events')
    .select('order_id')
    .eq('consultation_id', consultationId)
    .eq('event_type', 'order.created')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data?.order_id ?? null
}
