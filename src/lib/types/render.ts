/**
 * RenderResult — output dari render service
 *
 * Scalable structure untuk mendukung:
 * - Preview (sprint ini)
 * - Re-render, Compare, History (sprint berikutnya)
 * - Token analytics (sprint berikutnya)
 * - AI Inspector developer mode (sprint berikutnya)
 *
 * Status lifecycle:
 * idle → loading → (success | error)
 */
export interface RenderResult {
  status: 'idle' | 'loading' | 'success' | 'error'
  imageUrl?: string
  tokenUsage?: {
    total?: number
  }
  error?: string
  // Sprint O (Task 6, Render Session ID) — same ID used by the API and
  // Render History for this attempt, e.g. "RND-20260731-000001". Surfaced
  // here so the UI can show/log it (e.g. in an error message, "sertakan ID
  // ini saat melapor") without a second round-trip.
  renderId?: string
}

/**
 * RenderPayload — input ke /api/design/render
 * Struktur yang dikirim ke backend
 */
export interface RenderPayload {
  customerPhotoUrl: string
  componentSelections: Array<{
    componentType: string
    componentId: string
  }>
  // Sprint O (Render Session) — lets the API scope its Render Request Lock
  // and Render History row to this consultation. Optional so a caller that
  // doesn't have one yet degrades gracefully (server just records
  // consultation_id as null) instead of failing to send.
  consultationId?: string
}

/**
 * RenderServiceResponse — raw response dari API
 * Backend format (sebelum transform ke RenderResult)
 *
 * Shape mirrors the real /api/design/render response
 * (src/app/api/design/render/route.ts) — componentsUsed/componentsMissing
 * are object arrays (not string[]). Sprint PR-04 (Layer-Based Prompt
 * Compression) replaced the old promptCompression.totalTokens field with
 * a top-level promptTotalTokens + promptLayerReport (per-layer token/
 * priority/included breakdown), since compression is no longer one flat
 * pass over fixed buckets.
 */
export interface RenderServiceResponse {
  success: boolean
  renderedImageUrl?: string | null
  promptUsed?: string
  promptTotalTokens?: number
  promptLayerReport?: Array<{
    id: string
    label: string
    priority: 0 | 1 | 2
    tokens: number
    included: boolean
    truncated: boolean
  }>
  promptUncompressed?: string
  componentsUsed?: Array<{ id: string; name: string; category: string }>
  componentsMissing?: Array<{ componentId: string; componentType: string; reason: string }>
  error?: string
  renderId?: string
  // Present only on a 409 (Render Request Lock rejection) — the Render ID
  // of the render already in flight for this consultation.
  activeRenderId?: string
}
