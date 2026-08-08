import type { MasterDataCategory } from '@/lib/design/masterData'
import { REFERENCE_PRIORITY, type ReferenceType, type ReferenceRole } from './types'

// Reference Category Registry (Sprint R-05, Phase 3) — the ONE place a
// reference-eligible category's type/role/priority/instruction text are
// declared together. Before Sprint R-05, every implemented category was
// named individually in at least 3 places: composeAiAssets' descriptor-
// building, referenceBackedCategories' Set-building, and
// applyAssetInstructions' caveat-appending (all in composer.ts) — plus
// route.ts's own selection-lookup and asset-instruction-layer construction.
// Adding a category meant touching all of those independently, with no
// compiler check that any of them stayed in sync.
//
// Every consumer below now loops over REFERENCE_CATEGORY_REGISTRY instead
// of naming categories individually — adding a category means adding ONE
// entry here, nothing else. `idSuffix` is kept stable rather than derived
// from `category` so existing layerReport ids (Sprint R-04) and any
// external code matching on `asset_instruction:collar` etc. keep working
// unchanged — this registry is a pure internal refactor, not a rename.
//
// Architecture Lock (2026-08-04) — the model_thobe entry (MODEL_THOBE type,
// SILHOUETTE role, MODEL_REFERENCE_SILHOUETTE_INSTRUCTION) that used to be
// declared here first is REMOVED. Model Thobe no longer contributes any AI
// Asset — see aiAssetComposer/types.ts's header comment for where that
// render-quality-anchoring role went (GLOBAL_BASE_HERO_IMAGE_URL, Render
// Engine ownership, outside this registry).

// Component Reference Delta — Geometry (Sprint A, Reference Policy
// Refactor, 2026-08-05). These 3 constants used to each hold the FULL
// instruction text (framing + geometry list + ignore list, ~248 tokens
// combined) — Priority 0 audit found the framing identical in intent across
// all 3, now hoisted once to renderEngine/globalReferencePolicy.ts's
// GLOBAL_REFERENCE_POLICY_GEOMETRY (sent as its own Priority 0 layer,
// route.ts). What remains here is exactly what audit found to be genuine
// per-category content — collar GEOMETRY only, everything else (fabric/
// color/stitching/lighting/background) stays DNA-driven, same rule as
// before, unchanged in meaning: only the (already shared, now-hoisted)
// framing sentences are gone from this string, not any constraint.
export const COLLAR_REFERENCE_SHAPE_INSTRUCTION =
  'Transfer only: collar outline, collar curvature, collar opening, collar proportion, collar height. Do NOT copy: fabric texture, fabric color, stitching, lighting, wrinkles, shadows, background, photography style.'

// Same mechanism as COLLAR_REFERENCE_SHAPE_INSTRUCTION, for Placket —
// PLAKET_SHAPE geometry only (Sprint AI Stability Phase 2). Ignore list
// deliberately NOT unified with Collar's — it genuinely differs ("stitching
// thread color" vs Collar's plain "stitching"), so it stays Delta, not
// hoisted into the shared Global layer.
export const PLAKET_REFERENCE_SHAPE_INSTRUCTION =
  'Transfer only: placket outline, placket opening length, placket width, button spacing, stitch-line geometry. Do NOT copy: fabric texture, fabric color, stitching thread color, lighting, wrinkles, shadows, background, photography style.'

// Same mechanism as COLLAR_REFERENCE_SHAPE_INSTRUCTION, for Pocket —
// POCKET_SHAPE geometry only (Sprint AI Stability Phase 2).
export const POCKET_REFERENCE_SHAPE_INSTRUCTION =
  'Transfer only: pocket outline, pocket placement, pocket proportion, pocket flap/opening geometry. Do NOT copy: fabric texture, fabric color, stitching thread color, lighting, wrinkles, shadows, background, photography style.'

// Same mechanism as COLLAR_REFERENCE_SHAPE_INSTRUCTION, for Cuff — CUFF_SHAPE
// geometry only. Added this sprint ("Hero Image Manset" revision) — Manset
// previously had no AI Asset/Hero Image mechanism anywhere in this codebase
// (flagged repeatedly in prior sprints); this UAT specifically tests whether
// GPT Image needs the visual reference even though Manset's Prompt text
// stays one shared template across every item (no per-item text variation).
export const CUFF_REFERENCE_SHAPE_INSTRUCTION =
  'Transfer only: cuff outline, cuff proportion, cuff construction, cuff opening geometry. Do NOT copy: fabric texture, fabric color, stitching thread color, lighting, wrinkles, shadows, background, photography style.'

export interface ReferenceCategoryDefinition {
  category: MasterDataCategory
  type: ReferenceType
  role: ReferenceRole
  priority: number
  // Stable id fragment for layer/response identifiers (`asset_instruction:
  // ${idSuffix}`) — intentionally not derived from `category` (see header).
  idSuffix: string
  instructionLabel: string
  instruction: string
}

// Declared order is preserved everywhere this registry is iterated
// (composer.ts's caveat-appending, route.ts's layer construction) — same
// Collar > Plaket > Pocket order the pipeline has always used (Model was
// first before the Architecture Lock revision removed it, see header).
export const REFERENCE_CATEGORY_REGISTRY: ReferenceCategoryDefinition[] = [
  {
    category: 'kerah',
    type: 'COLLAR_REFERENCE',
    role: 'COLLAR_SHAPE',
    priority: REFERENCE_PRIORITY.COLLAR_REFERENCE ?? 90,
    idSuffix: 'collar',
    instructionLabel: 'Collar Reference Instruction',
    instruction: COLLAR_REFERENCE_SHAPE_INSTRUCTION,
  },
  {
    category: 'plaket',
    type: 'PLAKET_REFERENCE',
    role: 'PLAKET_SHAPE',
    priority: REFERENCE_PRIORITY.PLAKET_REFERENCE ?? 80,
    idSuffix: 'plaket',
    instructionLabel: 'Plaket Reference Instruction',
    instruction: PLAKET_REFERENCE_SHAPE_INSTRUCTION,
  },
  {
    category: 'saku',
    type: 'POCKET_REFERENCE',
    role: 'POCKET_SHAPE',
    priority: REFERENCE_PRIORITY.POCKET_REFERENCE ?? 70,
    idSuffix: 'pocket',
    instructionLabel: 'Pocket Reference Instruction',
    instruction: POCKET_REFERENCE_SHAPE_INSTRUCTION,
  },
  {
    category: 'manset',
    type: 'CUFF_REFERENCE',
    role: 'CUFF_SHAPE',
    priority: REFERENCE_PRIORITY.CUFF_REFERENCE ?? 60,
    idSuffix: 'cuff',
    instructionLabel: 'Cuff Reference Instruction',
    instruction: CUFF_REFERENCE_SHAPE_INSTRUCTION,
  },
]
