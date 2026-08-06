import type { SupabaseClient } from '@supabase/supabase-js'

// Render Final Storage (2026-08-07) — deliberately the simplest possible
// shape: one row per consultation, always overwritten in place. No
// versioning, no history, no prompt snapshot, no audit trail — see this
// sprint's brief. Production/Customer Journey/other workspaces only ever
// need `render_image_url`; nothing here tells them (or needs to tell them)
// whether it came from AI generation or a manual Replace.

export type RenderFinalStatus = 'draft' | 'approved'

export interface RenderFinal {
  id: string
  consultation_id: string
  customer_photo_url: string
  render_image_url: string
  render_status: RenderFinalStatus
  created_at: string
  updated_at: string
}

export const RENDER_FINAL_STATUS_LABELS: Record<RenderFinalStatus, string> = {
  draft: 'Draft',
  approved: 'Approved',
}

// Read-only lookup — null when this consultation has never had a
// successful render saved yet (brand-new session, or AI render never
// succeeded). Design Studio uses this on mount so Preview/Download/Replace/
// Approve persist across page reloads, not just within one session.
export async function fetchRenderFinal(
  supabase: SupabaseClient,
  consultationId: string
): Promise<RenderFinal | null> {
  const { data, error } = await supabase
    .from('render_finals')
    .select('*')
    .eq('consultation_id', consultationId)
    .maybeSingle()

  if (error) throw error
  return data
}

// Saves (or replaces) the Render Final for a consultation — upsert on
// `consultation_id` (unique), so this is always an overwrite, never a new
// row. Called both right after a successful AI render and after a manual
// Replace upload; either path resets `render_status` back to 'draft' — a
// new, unreviewed image must not silently inherit a previous Approval.
export async function saveRenderFinal(
  supabase: SupabaseClient,
  params: { consultationId: string; customerPhotoUrl: string; renderImageUrl: string }
): Promise<RenderFinal> {
  const { data, error } = await supabase
    .from('render_finals')
    .upsert(
      {
        consultation_id: params.consultationId,
        customer_photo_url: params.customerPhotoUrl,
        render_image_url: params.renderImageUrl,
        render_status: 'draft' satisfies RenderFinalStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'consultation_id' }
    )
    .select('*')
    .single()

  if (error) throw error
  return data
}

// Owner's explicit sign-off — the only transition allowed to set
// `render_status = 'approved'`. Nothing else in this module writes that
// value (mirrors the "one function owns one status transition" convention
// already used by aiDna/types.ts's markDnaApproved).
export async function approveRenderFinal(supabase: SupabaseClient, consultationId: string): Promise<void> {
  const { error } = await supabase
    .from('render_finals')
    .update({ render_status: 'approved' satisfies RenderFinalStatus, updated_at: new Date().toISOString() })
    .eq('consultation_id', consultationId)

  if (error) throw error
}

// Manual Replace — same deterministic-path + upsert:true + public-URL shape
// as masterData.ts's uploadMasterDataPhoto. The path is keyed only by
// consultationId (not a filename/timestamp), so re-uploading always
// overwrites the exact same Storage object — no versioning at the Storage
// layer either, matching the DB row's own always-overwrite semantics.
export async function uploadRenderFinalImage(
  supabase: SupabaseClient,
  params: { consultationId: string; file: File }
): Promise<string> {
  const ext = params.file.name.split('.').pop() || 'jpg'
  const path = `${params.consultationId}.${ext}`

  const { error } = await supabase.storage.from('render-finals').upload(path, params.file, { upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from('render-finals').getPublicUrl(path)
  return data.publicUrl
}
