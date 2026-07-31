import type { MasterDataCategory } from '@/lib/design/masterData'
import { REFERENCE_PRIORITY, type ReferenceType, type ReferenceRole } from './types'

// Reference Category Registry (Sprint R-05, Phase 3) — the ONE place a
// reference-eligible category's type/role/priority/instruction text are
// declared together. Before this sprint, every one of the 4 implemented
// categories (Model Thobe/Kerah/Plaket/Saku) was named individually in at
// least 3 places: composeAiAssets' descriptor-building, referenceBacked
// Categories' Set-building, and applyAssetInstructions' caveat-appending
// (all in composer.ts) — plus route.ts's own selection-lookup and asset-
// instruction-layer construction. Adding a 5th category (Cuff Reference,
// referenced as a real future item in composer.ts's Phase 6 extension-point
// comment) meant touching all of those independently, with no compiler
// check that any of them stayed in sync.
//
// Every consumer below now loops over REFERENCE_CATEGORY_REGISTRY instead
// of naming categories individually — adding a category means adding ONE
// entry here, nothing else. `idSuffix` is kept stable rather than derived
// from `category` so existing layerReport ids (Sprint R-04) and any
// external code matching on `asset_instruction:model` etc. keep working
// unchanged — this registry is a pure internal refactor, not a rename.

// The exact instruction GPT Image needs alongside a Model Thobe AI Asset so
// it doesn't copy that specific reference photo's collar/cuff/pocket/
// color/fabric onto a customer who chose different DNA for those — this
// text is what the SILHOUETTE role is FOR (see types.ts).
export const MODEL_REFERENCE_SILHOUETTE_INSTRUCTION =
  'The attached reference image is provided ONLY to describe the overall silhouette, garment proportion, garment length, and natural drape of the thobe. Do NOT copy or preserve the collar, cuffs, pockets, placket, embroidery, buttons, fabric texture, or color from the reference image. Those elements are defined separately by the selected Design DNA and must follow the customer\'s chosen configuration. Apply only the overall garment shape from the reference while preserving the customer\'s identity completely.'

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
// Model > Collar > Plaket > Pocket order the pipeline has always used.
export const REFERENCE_CATEGORY_REGISTRY: ReferenceCategoryDefinition[] = [
  {
    category: 'model_thobe',
    type: 'MODEL_THOBE',
    role: 'SILHOUETTE',
    priority: REFERENCE_PRIORITY.MODEL_THOBE ?? 100,
    idSuffix: 'model',
    instructionLabel: 'Model Reference Instruction',
    instruction: MODEL_REFERENCE_SILHOUETTE_INSTRUCTION,
  },
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
