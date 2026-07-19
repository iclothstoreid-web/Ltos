import type { SupabaseClient } from '@supabase/supabase-js'

// One slot per customer photo angle, re-uploading a slot overwrites which
// URL onChange stores — but the bucket's RLS only grants INSERT (same as
// production-evidence), so upsert must stay false and the path must be
// unique per attempt, or every upload/re-upload silently fails.
export async function uploadConsultationPhoto(
  supabase: SupabaseClient,
  params: { consultationId: string; slot: 'front' | 'side' | 'back'; file: File }
): Promise<string> {
  const ext = params.file.name.split('.').pop() || 'jpg'
  const path = `${params.consultationId}/${params.slot}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('consultation-photos')
    .upload(path, params.file, { upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from('consultation-photos').getPublicUrl(path)
  return data.publicUrl
}

// Documents aren't single-slot (a consultation can have many reference
// files), so each upload gets its own generated id in the path instead of a
// deterministic slot.
export async function uploadConsultationDocument(
  supabase: SupabaseClient,
  params: { consultationId: string; file: File }
): Promise<{ id: string; url: string }> {
  const id = crypto.randomUUID()
  const ext = params.file.name.split('.').pop() || 'bin'
  const path = `${params.consultationId}/${id}.${ext}`

  const { error } = await supabase.storage
    .from('consultation-documents')
    .upload(path, params.file, { upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from('consultation-documents').getPublicUrl(path)
  return { id, url: data.publicUrl }
}
