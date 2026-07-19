import type { SupabaseClient } from '@supabase/supabase-js'

// Same deterministic-path + upsert + public URL shape as
// uploadMasterDataPhoto/uploadEvidencePhoto — one slot per customer photo
// angle, re-uploading a slot simply overwrites it.
export async function uploadConsultationPhoto(
  supabase: SupabaseClient,
  params: { consultationId: string; slot: 'front' | 'side' | 'back'; file: File }
): Promise<string> {
  const ext = params.file.name.split('.').pop() || 'jpg'
  const path = `${params.consultationId}/${params.slot}.${ext}`

  const { error } = await supabase.storage
    .from('consultation-photos')
    .upload(path, params.file, { upsert: true })
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
