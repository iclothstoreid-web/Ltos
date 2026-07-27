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
}

/**
 * RenderServiceResponse — raw response dari API
 * Backend format (sebelum transform ke RenderResult)
 *
 * Shape mirrors the real /api/design/render response
 * (src/app/api/design/render/route.ts) — componentsUsed/componentsMissing
 * are object arrays (not string[]), and token count lives nested under
 * promptCompression.totalTokens (from compressPrompt()), not a top-level
 * totalTokens field.
 */
export interface RenderServiceResponse {
  success: boolean
  renderedImageUrl?: string | null
  promptUsed?: string
  promptCompression?: {
    compressed: string
    totalTokens: number
    metadata: {
      sectionsIncluded: string[]
      sectionsOmitted: string[]
      estimatedTokens: Record<string, number>
    }
  }
  promptUncompressed?: string
  componentsUsed?: Array<{ id: string; name: string; category: string }>
  componentsMissing?: Array<{ componentId: string; componentType: string; reason: string }>
  error?: string
}
