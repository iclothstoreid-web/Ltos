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
}

export const DEFAULT_GLOBAL_RENDER_POLICY: GlobalRenderPolicy = {
  camera: {},
  pose: {},
  lighting: {},
  background: {},
  quality: {},
  style: {},
  negativeRules: [],
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
  // Provenance — which Master Items (in which resolved order) contributed,
  // so a future Prompt Builder / debugging tool can trace any field back to
  // its source without re-reading the individual Render Recipes itself.
  sources: RecipeSource[]
  composedAt: string
}
