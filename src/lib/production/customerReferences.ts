import type { SupabaseClient } from '@supabase/supabase-js'
import {
  decodeFitterEnhancements,
  type ConsultationDocument,
} from '@/components/workspace/consultation-review/fitterEnhancementsCodec'

// Referensi Customer files are uploaded in Consultation Review
// (DocumentUploader) and persisted for real in Supabase Storage, but the
// url/category only ever land inside consultations.notes (marker-encoded,
// see fitterEnhancementsCodec) — there's no consultation_id on `orders`
// (see lib/order/createOrder.ts), so this is the same read-only lookup
// through the business_events row that lib/production/customerPhoto.ts
// already uses. No schema change.
export async function getCustomerReferencesForOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<ConsultationDocument[]> {
  const { data: event } = await supabase
    .from('business_events')
    .select('consultation_id')
    .eq('order_id', orderId)
    .eq('event_type', 'order.created')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!event?.consultation_id) return []

  const { data: consultation } = await supabase
    .from('consultations')
    .select('notes')
    .eq('id', event.consultation_id)
    .single()

  return decodeFitterEnhancements(consultation?.notes ?? null).documents
}
