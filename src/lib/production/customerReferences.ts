import type { SupabaseClient } from '@supabase/supabase-js'
import {
  decodeFitterEnhancements,
  type ConsultationDocument,
} from '@/components/workspace/consultation-review/fitterEnhancementsCodec'

// Referensi Customer files are uploaded in Consultation Review
// (DocumentUploader) and persisted for real in Supabase Storage, but the
// url/category only ever land inside consultations.notes (marker-encoded,
// see fitterEnhancementsCodec) — there's no consultation_id on `orders`
// (see lib/order/createOrder.ts). Goes through get_production_customer_notes
// (SECURITY DEFINER) rather than reading business_events/consultations
// directly — see lib/production/customerPhoto.ts for why (same RPC, same
// reason, same fix).
export async function getCustomerReferencesForOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<ConsultationDocument[]> {
  const { data: notes } = await supabase.rpc('get_production_customer_notes', {
    p_order_id: orderId,
  })

  return decodeFitterEnhancements(notes ?? null).documents
}
