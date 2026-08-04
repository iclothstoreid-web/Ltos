import type { MasterDataCategory } from '@/lib/design/masterData'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'
import { QUALITY_FOUNDATION } from '@/lib/design/renderEngine/qualityFoundation'
import { GLOBAL_RENDER_POLICY_LOCK_RULES, GLOBAL_RENDER_POLICY_NEGATIVE_RULES } from '@/lib/design/renderEngine/globalRenderPolicy'
import {
  GLOBAL_RENDER_RECIPE_CAMERA,
  GLOBAL_RENDER_RECIPE_VISIBILITY,
  GLOBAL_RENDER_RECIPE_LIGHTING,
  GLOBAL_RENDER_RECIPE_COMPOSITION,
  GLOBAL_RENDER_RECIPE_BACKGROUND,
} from '@/lib/design/renderEngine/globalRenderRecipe'

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
  // Composition/Visibility (Render Engine Knowledge Refactor review revision,
  // 2026-08-04) — added so Global Render Recipe's Composition and Visibility
  // content has an actual field to be assigned to. Merged into
  // MasterRenderRecipe.composition/.visibilityRules by composer.ts the same
  // "policy baseline, item overrides" way camera/pose/lighting already are
  // — see composeRenderRecipe's own comment.
  composition: Record<string, unknown>
  visibilityRules: Record<string, unknown>
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

// Sprint AI-R2 (Part 1-3) established this singleton policy as the ONE
// place a render-quality/scene default is populated (root cause fix for a
// real half-body-crop bug — GPT Image had nothing telling it to keep the
// shot full-body). Its CONTENT has since been reorganized twice:
//   - Architecture Lock (2026-08-04) moved what was then called "Quality
//     Foundation" here from the model_thobe row's own ai_dna, so it applies
//     to every render regardless of selection, not just when a specific
//     Model Thobe is picked.
//   - Render Engine Knowledge Refactor (2026-08-04, same day) — that single
//     "Quality Foundation" blob mixed 3 genuinely different responsibilities
//     (quality target, garment constraint, and scene) in one place, and
//     duplicated content that belonged in `aiDna/types.ts`'s Engine defaults
//     (removed, see that file) or in Identity Lock's own template
//     (promptArchitectureV2/layers.ts, untouched). It is now composed from 3
//     single-responsibility Render Engine sources, each documenting its own
//     scope/exclusions and its own content decisions:
//     `renderEngine/qualityFoundation.ts` (quality field),
//     `renderEngine/globalRenderPolicy.ts` (lockRules/negativeRules), and
//     `renderEngine/globalRenderRecipe.ts` (camera/visibilityRules/
//     lighting/composition/background).
//   - Review revision (2026-08-04, same day) — Camera and Visibility were
//     one field (Camera carried both viewing angle and body-framing
//     extent); split into 2 per review. Composition was defined but had no
//     GlobalRenderPolicy field to be assigned to; the interface (and
//     composer.ts's policy-overlap merge) was extended to include it and
//     Visibility, per explicit review instruction to wire Composition into
//     Recipe Composer. composer.ts's merge ALGORITHM is unchanged — camera/
//     pose/lighting already merged "policy baseline, item overrides";
//     composition/visibilityRules now follow the identical pattern, no new
//     logic invented.
export const DEFAULT_GLOBAL_RENDER_POLICY: GlobalRenderPolicy = {
  camera: GLOBAL_RENDER_RECIPE_CAMERA,
  pose: {},
  lighting: GLOBAL_RENDER_RECIPE_LIGHTING,
  composition: GLOBAL_RENDER_RECIPE_COMPOSITION,
  visibilityRules: GLOBAL_RENDER_RECIPE_VISIBILITY,
  background: GLOBAL_RENDER_RECIPE_BACKGROUND,
  quality: { foundation: QUALITY_FOUNDATION.join(' ') },
  style: {},
  negativeRules: [...GLOBAL_RENDER_POLICY_NEGATIVE_RULES],
  lockRules: [...GLOBAL_RENDER_POLICY_LOCK_RULES],
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
