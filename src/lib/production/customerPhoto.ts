import type { SupabaseClient } from '@supabase/supabase-js'
import { decodeFitterEnhancements } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'

// Customer photos are captured in Consultation Review (CustomerPhotoCapture)
// and persisted for real in Supabase Storage, but the URL only ever lands
// inside consultations.notes (marker-encoded, see fitterEnhancementsCodec) —
// there's no consultation_id on `orders` (see lib/order/createOrder.ts), so
// this is a read-only lookup through the same business_events row
// lib/order/lookup.ts already uses in the other direction. No schema change.
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

  const { customerPhotos } = decodeFitterEnhancements(consultation?.notes ?? null)
  return customerPhotos.front ?? customerPhotos.side ?? customerPhotos.back ?? null
}
