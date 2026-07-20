import type { SupabaseClient } from '@supabase/supabase-js'
import { decodeCustomerDigitalProfile } from '@/lib/customerProfile/codec'

// Measurement is the single source of truth for the customer photo (folded
// into the Customer Digital Profile, marker-encoded in consultations.notes —
// see codec.ts). There's no consultation_id on `orders` (see
// lib/order/createOrder.ts). Goes through get_production_customer_notes
// (SECURITY DEFINER) rather than reading business_events/consultations
// directly — both tables' RLS is correctly staff-only, and the kiosk has no
// auth.uid(), so a direct read always silently returned nothing. Same
// open-kiosk RPC pattern every other kiosk read already uses.
export async function getCustomerPhotoForOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<string | null> {
  const { data: notes } = await supabase.rpc('get_production_customer_notes', {
    p_order_id: orderId,
  })

  const profile = decodeCustomerDigitalProfile(notes ?? null)
  return profile?.customerPhoto?.url ?? null
}
