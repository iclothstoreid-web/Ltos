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

// The exact instruction GPT Image needs alongside a Collar AI Asset —
// collar GEOMETRY only, everything else (fabric/color/stitching/lighting/
// background) stays DNA-driven.
export const COLLAR_REFERENCE_SHAPE_INSTRUCTION =
  'The attached collar reference image is provided ONLY to describe the collar shape and geometry. Transfer only: collar outline, collar curvature, collar opening, collar proportion, collar height. Do NOT copy: fabric texture, fabric color, stitching, lighting, wrinkles, shadows, background, photography style. The collar must still follow the selected AI Design DNA. This reference is only a geometric guide for the collar shape.'

// Same mechanism as COLLAR_REFERENCE_SHAPE_INSTRUCTION, for Placket —
// PLAKET_SHAPE geometry only (Sprint AI Stability Phase 2).
export const PLAKET_REFERENCE_SHAPE_INSTRUCTION =
  'The attached placket reference image is provided ONLY to describe the placket shape and geometry. Transfer only: placket outline, placket opening length, placket width, button spacing, stitch-line geometry. Do NOT copy: fabric texture, fabric color, stitching thread color, lighting, wrinkles, shadows, background, photography style. The placket must still follow the selected AI Design DNA. This reference is only a geometric guide for the placket shape.'

// Same mechanism as COLLAR_REFERENCE_SHAPE_INSTRUCTION, for Pocket —
// POCKET_SHAPE geometry only (Sprint AI Stability Phase 2).
export const POCKET_REFERENCE_SHAPE_INSTRUCTION =
  'The attached pocket reference image is provided ONLY to describe the pocket shape and geometry. Transfer only: pocket outline, pocket placement, pocket proportion, pocket flap/opening geometry. Do NOT copy: fabric texture, fabric color, stitching thread color, lighting, wrinkles, shadows, background, photography style. The pocket must still follow the selected AI Design DNA. This reference is only a geometric guide for the pocket shape.'

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
]
