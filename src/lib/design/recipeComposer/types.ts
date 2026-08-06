import type { MasterDataCategory } from '@/lib/design/masterData'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'
import { GLOBAL_QUALITY_RULES } from '@/lib/design/renderEngine/globalQualityRules'
import { GARMENT_LAYOUT_RULES } from '@/lib/design/renderEngine/garmentLayout'
import { FINAL_CONSTRAINTS } from '@/lib/design/renderEngine/finalConstraints'
import {
  SCENE_CONFIGURATION_CAMERA,
  SCENE_CONFIGURATION_VISIBILITY,
  SCENE_CONFIGURATION_LIGHTING,
  SCENE_CONFIGURATION_COMPOSITION,
  SCENE_CONFIGURATION_BACKGROUND,
} from '@/lib/design/renderEngine/sceneConfiguration'

// Recipe Composer — the ONLY layer allowed to combine multiple Master
// Items' Render Recipes (+ the Global Render Policy) into one Master
// Render Recipe. Sits between Render Recipe and Prompt Builder in the
// locked architecture:
//
//   Render Recipe -> Recipe Composer -> Master Render Recipe -> Prompt Builder
//
// Prompt Builder must never merge recipes itself — it only translates
// whatever Master Render Recipe this module hands it (see composer.ts).

// Global, singleton policy (not per-item, not per-category) — applies
// across every render regardless of which Master Items are involved.
export interface GlobalRenderPolicy {
  camera: Record<string, unknown>
  pose: Record<string, unknown>
  lighting: Record<string, unknown>
  composition: Record<string, unknown>
  visibilityRules: Record<string, unknown>
  background: Record<string, unknown>
  quality: Record<string, unknown>
  style: Record<string, unknown>
  // Prompt Architecture Realignment (2026-08-06) — was `lockRules` +
  // `negativeRules`. The Engine keeps these as two DISTINCT, separately
  // named sections (unlike a DNA Component's single merged `componentRules`
  // — see aiDna/types.ts) because they are two different Prompt Builder
  // steps at two different positions: Garment Layout (step 5, positive
  // framing) and Final Constraints (step 13, the closing negative
  // safety net). Sourced from renderEngine/garmentLayout.ts and
  // renderEngine/finalConstraints.ts respectively — wording unchanged from
  // the prior GLOBAL_RENDER_POLICY_LOCK_RULES/_NEGATIVE_RULES.
  garmentLayoutRules: string[]
  finalConstraintRules: string[]
}

export const DEFAULT_GLOBAL_RENDER_POLICY: GlobalRenderPolicy = {
  camera: SCENE_CONFIGURATION_CAMERA,
  pose: {},
  lighting: SCENE_CONFIGURATION_LIGHTING,
  composition: SCENE_CONFIGURATION_COMPOSITION,
  visibilityRules: SCENE_CONFIGURATION_VISIBILITY,
  background: SCENE_CONFIGURATION_BACKGROUND,
  quality: { foundation: GLOBAL_QUALITY_RULES.join(' ') },
  style: {},
  garmentLayoutRules: [...GARMENT_LAYOUT_RULES],
  finalConstraintRules: [...FINAL_CONSTRAINTS],
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
// Render Recipe + the Global Render Policy separately.
//
// NEVER persisted — temporary, assembled on demand only, same
// non-persistence rule as RenderContext (src/lib/customerProfile/renderContext.ts).
// Never stores a prompt/sentence, only structured data (same rule as
// Render Recipe itself) — `garmentLayoutRules`/`finalConstraintRules`/
// `componentRulesByCategory` are the one exception already established by
// the prior `negativeRules`/`lockRules` fields: short authored constraint
// sentences, not narrative prose.
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
  // these (identity/construction is per-item, never a global default). Kept
  // for diagnostics/debug trace (composeRenderRecipeTrace) — Prompt
  // Builder's own per-component steps read `entries` directly instead (see
  // promptBuilder/compression.ts), avoiding the same-key collision this
  // merged view is prone to when more than one component shares a key.
  garment: Record<string, unknown>
  fabricIdentity: Record<string, unknown>
  stitching: Record<string, unknown>
  embroidery: Record<string, unknown>
  background: Record<string, unknown>
  quality: Record<string, unknown>
  style: Record<string, unknown>
  // Prompt Architecture Realignment (2026-08-06) — replaces the old flat
  // `negativeRules`/`lockRules` (which unioned EVERY component's own rules
  // into one undifferentiated pool, emitted as two early layers before any
  // component's own section). Engine-only now: sourced purely from
  // `policy.garmentLayoutRules`/`policy.finalConstraintRules`, no per-item
  // contribution — see composer.ts's composeRenderRecipe. `garmentLayoutRules`
  // additionally carries Look Cutting's own resolved componentRules when
  // Look Cutting was selected (it has no dedicated Prompt Builder step) —
  // as of the Look Cutting Repository Refactor (2026-08-06, aiDna/types.ts)
  // that category no longer carries any componentRules, so this is a
  // permanent no-op now.
  garmentLayoutRules: string[]
  finalConstraintRules: string[]
  // Per-category resolved Component Rules (Component Default Knowledge +
  // Component Delta Knowledge, same resolveComponentKnowledge merge as
  // Component Identity Knowledge below) — read by Prompt Builder at each
  // component's own step (Collar/Placket/Pocket/Cuff/Material). Absent key
  // means that category was not selected this render.
  componentRulesByCategory: Partial<Record<MasterDataCategory, string[]>>
  // Provenance — which Master Items (in which resolved order) contributed,
  // so a future Prompt Builder / debugging tool can trace any field back to
  // its source without re-reading the individual Render Recipes itself.
  sources: RecipeSource[]
  composedAt: string
}
