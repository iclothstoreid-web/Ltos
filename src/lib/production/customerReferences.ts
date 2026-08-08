import type { SupabaseClient } from '@supabase/supabase-js'
import {
  decodeFitterEnhancements,
  type ConsultationDocument,
} from '@/components/workspace/consultation-review/fitterEnhancementsCodec'
import { fetchCustomerNotesForOrder } from './customerNotes'

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
  const notes = await fetchCustomerNotesForOrder(supabase, orderId)
  return decodeFitterEnhancements(notes).documents
}
