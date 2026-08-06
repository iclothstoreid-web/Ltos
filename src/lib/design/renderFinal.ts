import type { SupabaseClient } from '@supabase/supabase-js'

// Render Final Storage (2026-08-07, Final Security Refactor) — deliberately
// the simplest possible shape: one row per consultation, always overwritten
// in place. No versioning, no history, no prompt snapshot, no audit trail.
// Production/Customer Journey/other workspaces are NOT wired to this module
// this sprint — Render Final stays Design-Studio-only until a future sprint
// explicitly connects a consumer.
//
// Store Private, Access by Signed URL — Render Final is an internal LTOS
// asset, not a public one. The render-finals Storage bucket is private; the
// database stores ONLY the object path (`render_storage_path`), never a
// fetchable URL. A signed URL is minted on demand (createRenderFinalSignedUrl
// below), short TTL, and is never persisted anywhere — every Preview/Download
// gets its own fresh one.

export type RenderFinalStatus = 'draft' | 'approved'

export interface RenderFinal {
  id: string
  consultation_id: string
  customer_photo_url: string
  render_storage_path: string
  render_status: RenderFinalStatus
  created_at: string
  updated_at: string
}

export const RENDER_FINAL_STATUS_LABELS: Record<RenderFinalStatus, string> = {
  draft: 'Draft',
  approved: 'Approved',
}

export const RENDER_FINAL_BUCKET = 'render-finals'

// TTL for every signed URL this module mints — 1 hour, per this sprint's
// brief. Not configurable per-call on purpose: a single, auditable constant
// beats a parameter every caller could quietly override.
export const RENDER_FINAL_SIGNED_URL_TTL_SECONDS = 3600

// Fixed path per consultation — folder-per-consultation, constant filename.
// This is what makes "Replace always overwrites the same object, no
// versioning" a structural guarantee rather than a convention callers have
// to remember: there is only ever one possible path for a given
// consultation, regardless of how many times Generate/Replace runs or what
// file type was uploaded (see uploadRenderFinalFile's explicit `contentType`
// — the actual MIME type is carried by the upload's Content-Type header,
// never by the path's extension).
function renderFinalStoragePath(consultationId: string): string {
  return `${consultationId}/render.png`
}

// Read-only lookup — null when this consultation has never had a
// successful render saved yet. Design Studio uses this on mount so
// Replace/Approve state persist across page reloads, not just within one
// session. Never returns a usable image URL by itself — callers still need
// createRenderFinalSignedUrl for that.
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

// Saves (or replaces) the Render Final ROW for a consultation — upsert on
// `consultation_id` (unique), so this is always an overwrite, never a new
// row. Takes a Storage PATH, never a URL — the object itself must already
// be uploaded (see uploadRenderFinalFile/uploadRenderFinalFromDataUrl)
// before this is called. Called after both a successful AI render and a
// manual Replace upload; either path resets `render_status` back to
// 'draft' — a new, unreviewed image must not silently inherit a previous
// Approval.
export async function saveRenderFinal(
  supabase: SupabaseClient,
  params: { consultationId: string; customerPhotoUrl: string; renderStoragePath: string }
): Promise<RenderFinal> {
  const { data, error } = await supabase
    .from('render_finals')
    .upsert(
      {
        consultation_id: params.consultationId,
        customer_photo_url: params.customerPhotoUrl,
        render_storage_path: params.renderStoragePath,
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

// Manual Replace — uploads a File the owner picked to this consultation's
// fixed path (upsert: true, so it always overwrites the exact same
// Storage object — no versioning at the Storage layer, matching the row's
// own always-overwrite semantics). Returns the PATH, not a URL: the bucket
// is private, so there is no public URL to return anymore.
export async function uploadRenderFinalFile(
  supabase: SupabaseClient,
  params: { consultationId: string; file: File }
): Promise<string> {
  const path = renderFinalStoragePath(params.consultationId)

  const { error } = await supabase.storage
    .from(RENDER_FINAL_BUCKET)
    .upload(path, params.file, { upsert: true, contentType: params.file.type || 'image/png' })
  if (error) throw error

  return path
}

// AI-generated render — the render API returns the finished image as a
// `data:image/...;base64,...` URI (see src/lib/ai/services/image.ts: GPT
// Image models never populate a fetchable `.url`, only `b64_json`), never
// something already sitting in this bucket. This decodes that data URI and
// uploads the bytes to the same fixed per-consultation path a manual
// Replace would use — Generate and Replace end up in the exact same place,
// by the exact same rule. This function only reshapes bytes that already
// left the AI provider; it does not call OpenAI, does not touch the Prompt
// Builder/Render Engine, and is not part of the AI Pipeline.
export async function uploadRenderFinalFromDataUrl(
  supabase: SupabaseClient,
  params: { consultationId: string; dataUrl: string }
): Promise<string> {
  const match = params.dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    throw new Error('uploadRenderFinalFromDataUrl expected a data: URI (the AI render output shape).')
  }
  const [, contentType, base64] = match

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: contentType })

  const path = renderFinalStoragePath(params.consultationId)
  const { error } = await supabase.storage.from(RENDER_FINAL_BUCKET).upload(path, blob, { upsert: true, contentType })
  if (error) throw error

  return path
}

// The ONLY way to get a usable URL for a Render Final image. Short-TTL
// (RENDER_FINAL_SIGNED_URL_TTL_SECONDS), minted fresh on every call, never
// stored anywhere — callers (the signed-url API route; Design Studio via
// that route) must request a new one each time Preview needs to (re)display
// an image or Download needs to fetch one. Requires the caller's Supabase
// client to pass the same staff-role RLS check as every other read of this
// bucket (storage.objects SELECT policy) — signing a URL for an object you
// aren't allowed to read is refused by Supabase Storage itself, this
// function doesn't re-implement that check.
export async function createRenderFinalSignedUrl(supabase: SupabaseClient, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(RENDER_FINAL_BUCKET)
    .createSignedUrl(path, RENDER_FINAL_SIGNED_URL_TTL_SECONDS)

  if (error) throw error
  return data.signedUrl
}
