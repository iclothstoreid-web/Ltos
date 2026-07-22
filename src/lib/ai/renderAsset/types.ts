// Render Asset Domain — the reusable object that will eventually wrap
// whatever an AI image render service (see src/lib/ai/services/image.ts)
// produces, giving it its own lifecycle independent of any single provider
// call. Sits AFTER Image Service in the locked architecture:
//
//   ... -> Prompt Serializer -> Prompt String -> Image Service (OpenAI)
//     -> RenderResult -> RenderAsset (this file)
//
// Domain object only this sprint: no storage, no database, no migration,
// no API route, no server action, no OpenAI call, no changes to AI Design
// DNA, Render Recipe, Recipe Composer, Prompt Builder, Prompt Serializer,
// or Image Service. Those modules do not read from or write to this file
// yet — a later sprint decides if/how Image Service adapts to return this
// shape.
export type RenderStatus =
  | 'draft'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'approved'
  | 'published'
  | 'archived'

// One error captured for a render that failed while `processing`.
// Structured facts only, same "never store a prompt/sentence, only
// structured data" rule as Render Recipe / Master Render Recipe.
export interface RenderError {
  message: string
  code: string | null
  occurredAt: string
}

// Facts describing HOW a render was produced, not the pixels themselves —
// deliberately provider-agnostic so any provider under src/lib/ai/providers
// can fill the same shape, not just OpenAI.
export interface RenderMetadata {
  provider: string | null
  model: string | null
  requestedAt: string | null
  completedAt: string | null
  durationMs: number | null
  revisedPrompt: string | null
}

// The output of one successful render. `url`/`base64` mirror the two forms
// Image Service already returns (see GeneratedImage in
// src/lib/ai/services/image.ts) without importing that file — this domain
// must stay independent of any one service's return shape.
export interface RenderResult {
  url: string | null
  base64: string | null
  metadata: RenderMetadata
}

// One attempt at rendering — every retry/regeneration produces a new
// version rather than overwriting the last one, so approval/publish
// history is never lost.
export interface RenderVersion {
  versionNumber: number
  status: RenderStatus
  result: RenderResult | null
  error: RenderError | null
  createdAt: string
}

// Render Asset — the top-level reusable domain object for one AI-rendered
// image across its whole lifecycle:
//
//   Draft -> Processing -> Completed -> Approved -> Published -> Archived
//                             |
//                             +-> Failed (retry sends it back to Processing)
//
// Never persisted this sprint (no table/migration exists) — purely a
// domain shape a later sprint may choose to store.
export interface RenderAsset {
  id: string
  status: RenderStatus
  currentVersion: number
  versions: RenderVersion[]
  createdAt: string
  updatedAt: string
}

export const RENDER_STATUS_LABELS: Record<RenderStatus, string> = {
  draft: 'Draft',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
}

// Display order for a lifecycle indicator — the brief's own linear path;
// `failed` is a branch off `processing`, not a step in this main sequence.
export const RENDER_LIFECYCLE_ORDER: RenderStatus[] = [
  'draft',
  'processing',
  'completed',
  'approved',
  'published',
  'archived',
]

// A new Render Asset always starts empty and in Draft — no version exists
// yet because nothing has been sent to Image Service.
export function createDraftRenderAsset(id: string, createdAt: string): RenderAsset {
  return {
    id,
    status: 'draft',
    currentVersion: 0,
    versions: [],
    createdAt,
    updatedAt: createdAt,
  }
}
