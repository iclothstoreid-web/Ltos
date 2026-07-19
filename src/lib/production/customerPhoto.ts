import type { SupabaseClient } from '@supabase/supabase-js'
import { decodeCustomerDigitalProfile } from '@/lib/customerProfile/codec'

// Measurement is the single source of truth for the customer photo (folded
// into the Customer Digital Profile, marker-encoded in consultations.notes —
// see codec.ts). There's no consultation_id on `orders` (see
// lib/order/createOrder.ts), so this is a read-only lookup through the same
// business_events row lib/order/lookup.ts already uses in the other
// direction. No schema change.
export async function getCustomerPhotoForOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<string | null> {
  const { data: event } = await supabase
    .from('business_events')
    .select('consultation_id')
    .eq('order_id', orderId)
    .eq('event_type', 'order.created')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!event?.consultation_id) return null

  const { data: consultation } = await supabase
    .from('consultations')
    .select('notes')
    .eq('id', event.consultation_id)
    .single()

  const profile = decodeCustomerDigitalProfile(consultation?.notes ?? null)
  return profile?.customerPhoto?.url ?? null
}
