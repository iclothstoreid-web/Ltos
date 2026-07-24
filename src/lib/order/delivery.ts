import type { SupabaseClient } from '@supabase/supabase-js'

// Delivery hotfix -- the missing write path for Customer Journey's
// "Delivered" sub-state. See supabase/migrations/20260805000000_add_delivery_hotfix.sql.
// Staff-facing only (Owner OS); the RPC itself enforces that the shipping
// stage must already be completed.
export async function markOrderDelivered(supabase: SupabaseClient, orderId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_order_delivered', { p_order_id: orderId })
  if (error) throw error
}
