import type { SupabaseClient } from '@supabase/supabase-js'
import { decodeCustomerDigitalProfile } from '@/lib/customerProfile/codec'
import {
  decodeFitterEnhancements,
  type ConsultationDocument,
} from '@/components/workspace/consultation-review/fitterEnhancementsCodec'

// Query Optimization (STEP 2, P1) — getCustomerPhotoForOrder and
// getCustomerReferencesForOrder both called RPC get_production_customer_notes
// independently for the same orderId, then decoded the same notes blob two
// different ways. Shared here so both photo and references come from one
// fetch instead of two.
async function fetchCustomerNotesForOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<string | null> {
  const { data: notes } = await supabase.rpc('get_production_customer_notes', {
    p_order_id: orderId,
  })
  return notes ?? null
}

export async function getCustomerPhotoAndReferencesForOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<{ customerPhotoUrl: string | null; customerReferences: ConsultationDocument[] }> {
  const notes = await fetchCustomerNotesForOrder(supabase, orderId)
  return {
    customerPhotoUrl: decodeCustomerDigitalProfile(notes)?.customerPhoto?.url ?? null,
    customerReferences: decodeFitterEnhancements(notes).documents,
  }
}

export { fetchCustomerNotesForOrder }
