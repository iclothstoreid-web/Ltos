import type { SupabaseClient } from '@supabase/supabase-js'

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
