import type { MasterDataCategory } from '@/lib/design/masterData'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'

// Recipe Composer — the ONLY layer allowed to combine multiple Master
// Items' Render Recipes (+ the Global Render Policy) into one Master
// Render Recipe. Sits between Render Recipe and the future Prompt Builder
// in the locked architecture:
//
//   Render Recipe -> Recipe Composer -> Master Render Recipe -> Prompt Builder
//
// Prompt Builder must never merge recipes itself — it only translates
// whatever Master Render Recipe this module hands it (see composer.ts).
// This sprint builds structure/interfaces only: no merge logic, no
// conflict-resolution algorithm, no AI, no UI/editor.

// Global, singleton policy (not per-item, not per-category) — applies
// across every render regardless of which Master Items are involved.
// Placeholder only this sprint; no editor exists yet.
export interface GlobalRenderPolicy {
  camera: Record<string, unknown>
  pose: Record<string, unknown>
  lighting: Record<string, unknown>
  background: Record<string, unknown>
  quality: Record<string, unknown>
  style: Record<string, unknown>
  negativeRules: string[]
  // Reference-First Cleanup — global-policy floor for Lock Rules, merged
  // with every item's own AiDesignDna.lockRules the same way negativeRules
  // already merges (see composer.ts). Empty by default — the real seed
  // content lives per-item (per-item scope decision), not here.
  lockRules: string[]
}

// Sprint AI-R2 (Part 1-3) — the ONE place this "applies to every render"
// singleton policy actually gets populated. Root cause of the reported
// half-body crop bug (confirmed by reading the pipeline, not assumed): before
// this sprint every field below was `{}`/`[]`, so NOTHING anywhere in the
// live pipeline ever told GPT Image to keep the shot full-body — no item's
// Render Recipe sets `camera` either (see Sprint AI-R1's audit). GPT Image
// then picked its own default framing, which is commonly half-body for a
// person-centric edit. `camera`/`quality` stay short on purpose: both share
// Prompt Compression's ~55-token "Other" bucket with lighting/background/
// stitching/embroidery (src/lib/design/promptBuilder/compression.ts) — a
// longer instruction here risks being silently truncated once components
// start populating those other fields too. `negativeRules` carries the bulk
// of the Identity Lock / Garment Lock constraints instead, since it has its
// own dedicated ~50-token budget AND is the one mechanism GPT Image actually
// has for negative instructions (serializeOpenAI turns it into an explicit
// "Avoid: ..." clause — GPT Image has no separate negative-prompt param).
export const DEFAULT_GLOBAL_RENDER_POLICY: GlobalRenderPolicy = {
  camera: { framing: 'full body head-to-toe, feet visible, original camera framing, no crop' },
  pose: {},
  lighting: {},
  background: {},
  quality: { lock: 'identity and pose locked — only clothing changes' },
  style: {},
  negativeRules: [
    'body crop, half-body, missing feet, wrong framing',
    'face, age, body shape, hairstyle, beard, skin tone, expression, ethnicity changed',
    'camera, lighting, background changed',
    'thobe replaced by shirt, polo, hoodie, t-shirt, jacket, tunic',
    'short sleeves, low collar, non-Saudi silhouette',
  ],
  lockRules: [],
}

// One Master Item's Render Recipe plus the ordering info Recipe Composer
// needs to merge it — `priority` mirrors that item's own
// `RenderRecipe.renderPriority` context (e.g. Model before Collar before
// Pocket), kept alongside rather than only inside the recipe so sorting
// doesn't require reaching into each recipe's internals.
export interface RenderRecipeEntry {
  itemId: string
  category: MasterDataCategory
  recipe: RenderRecipe
  priority: number
}

export interface RecipeSource {
  itemId: string
  category: MasterDataCategory
  priority: number
}

// Result of Recipe Composer's merge — a single, self-contained structure
// so Prompt Builder can read this ONE object instead of every contributing
// Render Recipe + the Global Render Policy separately (Task 7).
//
// NEVER persisted (Task 6) — temporary, assembled on demand only, same
// non-persistence rule as RenderContext (src/lib/customerProfile/renderContext.ts).
// Never stores a prompt/sentence, only structured data (same rule as
// Render Recipe itself).
export interface MasterRenderRecipe {
  camera: Record<string, unknown>
  pose: Record<string, unknown>
  lighting: Record<string, unknown>
  composition: Record<string, unknown>
  focus: Record<string, unknown>
  fabricBehavior: Record<string, unknown>
  visibilityRules: Record<string, unknown>
  // Same Component-DNA producers as RenderRecipe (see renderRecipe/types.ts)
  // — Recipe Composer merges them with the same per-item algorithm as the
  // other 7 shared fields; no GlobalRenderPolicy equivalent exists for
  // these (identity/construction is per-item, never a global default).
  garment: Record<string, unknown>
  fabricIdentity: Record<string, unknown>
  stitching: Record<string, unknown>
  embroidery: Record<string, unknown>
  background: Record<string, unknown>
  quality: Record<string, unknown>
  style: Record<string, unknown>
  negativeRules: string[]
  lockRules: string[]
  // Provenance — which Master Items (in which resolved order) contributed,
  // so a future Prompt Builder / debugging tool can trace any field back to
  // its source without re-reading the individual Render Recipes itself.
  sources: RecipeSource[]
  composedAt: string
}
