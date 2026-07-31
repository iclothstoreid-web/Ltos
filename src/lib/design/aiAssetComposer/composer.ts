import { MASTER_DATA_CATEGORIES, type MasterDataCategory, type MasterDataOption } from '@/lib/design/masterData'
import { REFERENCE_PRIORITY, type ReferenceImageDescriptor } from './types'

// AI Asset Composer (renamed from Reference Composer this sprint — "AI
// Asset Lifecycle" brief) — the ONLY place allowed to decide which visual
// AI Assets accompany a render request. Sits alongside Recipe Composer in
// the pipeline, but composes IMAGES, not text:
//
//   Customer Photo -------------------------------------\
//   Model Thobe   (approved AI Design DNA + Hero Image) --\
//   Collar/Kerah  (approved AI Design DNA + Hero Image) ---- AI Asset Composer -> images.edit
//   Plaket        (approved AI Design DNA + Hero Image) --/  (only when
//   Saku/Pocket   (approved AI Design DNA + Hero Image) -/    APPROVED)
//   Cuff/Bahan/Warna/... ---------------------------------  (never contribute
//                                                            an image; text-
//                                                            only, via Recipe
//                                                            Composer)
//
// THE KEY RULE THIS SPRINT ADDS: an AI Asset is ACTIVE if and only if that
// item's `ai_dna.status === 'approved'` (AND it is `is_active` in the
// catalog) — not merely "has a sourceImage." Before this sprint,
// `composeReferenceImages` (the old name) only checked `sourceImage`
// truthiness, which `markDnaGenerated` alone already sets (status
// 'draft') — meaning a never-reviewed draft was already being sent to
// OpenAI as if it were approved. This function is the fix: Upload Hero
// Image -> Generate AI Design DNA (draft) -> Review -> Approve
// (markDnaApproved, aiDna/types.ts) -> AI Asset ACTIVE. There is
// deliberately no "Add Reference"/"Create AI Asset" action anywhere in this
// codebase — an AI Asset is a DERIVED FACT of an approved AI Design DNA,
// never an independently-created entity (see AiDesignDnaSection.tsx /
// MasterDataManager.tsx's Approve button, the only writer of `approved`).
//
// COLLAR_REFERENCE reuses the exact same mechanism Model Thobe already
// established. No new DB column, no new table: "Design Master cukup
// memiliki Hero Image, AI Design DNA, Status" — MasterDataOption already
// has exactly those 3 things (photo_url, ai_dna, and ai_dna.status is the
// Status). Only ONE kerah item is ever selectable per render (Design
// Studio's design spec has a single `collar` field), so "no duplicate
// collar reference" is a structural guarantee of this function's own input
// shape (`collarOption` is one value, never an array), not something
// validated after the fact.
//
// PLAKET_REFERENCE and POCKET_REFERENCE (Sprint AI Stability Phase 2) reuse
// the identical mechanism again — `plaketOption`/`pocketOption` are single
// values for the same structural reason `collarOption` is. Phase 1's audit
// found both categories already had real, `approved` Hero Images sitting
// unused in the database (Plaket) or approved DNA with no reference
// implementation at all (Pocket) — this closes that gap; it does not add
// any new DB column, table, or upload flow.
//
// Background and Mannequin have no reference category anywhere in this
// codebase (confirmed: MASTER_DATA_CATEGORIES has no such entry) — their
// counts are hardcoded 0 to make that invariant an assertable fact rather
// than an implicit absence.

// The exact instruction GPT Image needs alongside a Model Thobe AI Asset so
// it doesn't copy that specific reference photo's collar/cuff/pocket/
// color/fabric onto a customer who chose different DNA for those — this
// text is what the SILHOUETTE role is FOR (see types.ts). Appended to the
// outgoing prompt only when a Model AI Asset is actually included.
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

export interface ExcludedReferenceCategory {
  category: MasterDataCategory
  reason: string
}

export interface ComposedAiAssets {
  customerPhotoUrl: string
  modelReference: ReferenceImageDescriptor | null
  collarReference: ReferenceImageDescriptor | null
  /** PLAKET_SHAPE — same 4-condition gate as collarReference (Sprint AI
   *  Stability Phase 2). */
  plaketReference: ReferenceImageDescriptor | null
  /** POCKET_SHAPE — same 4-condition gate as collarReference (Sprint AI
   *  Stability Phase 2). */
  pocketReference: ReferenceImageDescriptor | null
  /** Ordered: customer photo first, then every present AI Asset by
   *  descending priority (Model Reference 100, Collar Reference 90, Plaket
   *  Reference 80, Pocket Reference 70, ...) — same order the pipeline has
   *  always sent images in. */
  urls: string[]
  excluded: ExcludedReferenceCategory[]
  // Asserted invariants — always 0, no reference category for either
  // exists in this codebase.
  backgroundReferenceCount: 0
  mannequinReferenceCount: 0
}

// Phase 6 extension point ("Reference Evolution"): a future FABRIC_REFERENCE/
// EMBROIDERY_REFERENCE/PATTERN_REFERENCE would each be added as their own
// optional field here (e.g. `fabricReferenceOption?: MasterDataOption |
// null`), read the same way `collarOption`/`plaketOption`/`pocketOption` are
// below, and contribute their own descriptor to ComposedAiAssets —
// additive, no restructuring required.
export interface ComposeAiAssetsInput {
  customerPhotoUrl: string
  /** The resolved Model Thobe MasterDataOption for this render, or null if
   *  none was selected / it didn't resolve. Only its category is trusted
   *  to be 'model_thobe' — the caller must have already filtered for that.
   *  An AI Asset is composed in only if this item's `ai_dna.status ===
   *  'approved'`, it is `is_active`, and it has a `sourceImage`. */
  modelThobeOption: MasterDataOption | null
  /** The resolved Collar (kerah) MasterDataOption for this render, or null.
   *  Same 3-condition gate as `modelThobeOption` above. */
  collarOption?: MasterDataOption | null
  /** The resolved Placket (plaket) MasterDataOption for this render, or
   *  null. Same 4-condition gate as `collarOption` (Sprint AI Stability
   *  Phase 2). */
  plaketOption?: MasterDataOption | null
  /** The resolved Pocket (saku) MasterDataOption for this render, or null.
   *  Same 4-condition gate as `collarOption` (Sprint AI Stability Phase 2). */
  pocketOption?: MasterDataOption | null
  /** Every OTHER category present in this render's selection, purely so
   *  `excluded` can report exactly which ones were deliberately skipped
   *  for this request, not the full static category list. */
  otherSelectedCategories?: MasterDataCategory[]
}

const NON_REFERENCE_CATEGORIES: MasterDataCategory[] = MASTER_DATA_CATEGORIES.filter((c) => c !== 'model_thobe')

// Single 4-condition gate every AI Asset must clear — approved + active +
// has a Hero Image snapshot + has a valid (non-`empty`) Render Recipe
// (Sprint PR-01, P6: an approved DNA with no configured Render Recipe still
// has nothing structured for Recipe Composer to merge, so sending its photo
// as a reference without any accompanying recipe content would mislead
// GPT Image rather than help it). Shared by Model, Collar, Plaket, and
// Pocket below so the rule can only ever be expressed once.
//
// `metadata?.sourceImage` (Sprint R-02 fix, found while building the Lock
// Rules token report) — some Repository rows were authored with a
// non-conforming ai_dna shape that omits `metadata` entirely (confirmed
// live: "Patch Pocket Topstitched Medium", status already 'approved', has
// no `metadata` key at all — see aiDna/types.ts's markDnaGenerated/
// markDnaApproved, which already guard the same "metadata key missing"
// case on the write side with the identical `?? DEFAULT` pattern). Without
// the `?.` here, selecting that item threw before this function could ever
// return a normal INACTIVE result, crashing the whole render — a
// pre-existing bug, not something Reference-First introduced, but directly
// in this gate's own path.
function isAiAssetActive(option: MasterDataOption | null): boolean {
  return (
    !!option &&
    option.is_active &&
    option.ai_dna.status === 'approved' &&
    !!option.ai_dna.metadata?.sourceImage &&
    option.render_recipe.status !== 'empty'
  )
}

export function composeAiAssets(input: ComposeAiAssetsInput): ComposedAiAssets {
  const { customerPhotoUrl, modelThobeOption, collarOption = null, plaketOption = null, pocketOption = null, otherSelectedCategories } = input

  const modelReference: ReferenceImageDescriptor | null = isAiAssetActive(modelThobeOption)
    ? { type: 'MODEL_THOBE', role: 'SILHOUETTE', priority: REFERENCE_PRIORITY.MODEL_THOBE ?? 100, itemId: modelThobeOption!.id, url: modelThobeOption!.ai_dna.metadata.sourceImage! }
    : null

  const collarReference: ReferenceImageDescriptor | null = isAiAssetActive(collarOption)
    ? { type: 'COLLAR_REFERENCE', role: 'COLLAR_SHAPE', priority: REFERENCE_PRIORITY.COLLAR_REFERENCE ?? 90, itemId: collarOption!.id, url: collarOption!.ai_dna.metadata.sourceImage! }
    : null

  const plaketReference: ReferenceImageDescriptor | null = isAiAssetActive(plaketOption)
    ? { type: 'PLAKET_REFERENCE', role: 'PLAKET_SHAPE', priority: REFERENCE_PRIORITY.PLAKET_REFERENCE ?? 80, itemId: plaketOption!.id, url: plaketOption!.ai_dna.metadata.sourceImage! }
    : null

  const pocketReference: ReferenceImageDescriptor | null = isAiAssetActive(pocketOption)
    ? { type: 'POCKET_REFERENCE', role: 'POCKET_SHAPE', priority: REFERENCE_PRIORITY.POCKET_REFERENCE ?? 70, itemId: pocketOption!.id, url: pocketOption!.ai_dna.metadata.sourceImage! }
    : null

  // kerah/plaket/saku stay in `excluded` (still text-only, per Recipe
  // Composer) unless their real reference was actually composed in for
  // THIS render.
  const excludedCategorySet = new Set(otherSelectedCategories ?? NON_REFERENCE_CATEGORIES)
  if (collarReference) excludedCategorySet.delete('kerah')
  if (plaketReference) excludedCategorySet.delete('plaket')
  if (pocketReference) excludedCategorySet.delete('saku')
  const excluded: ExcludedReferenceCategory[] = Array.from(excludedCategorySet).map((category) => ({
    category,
    reason:
      'Component DNA (AI Design DNA / Render Recipe) is the source of truth for this category — it is described to GPT Image as text via Recipe Composer/Prompt Builder, never as an image reference.',
  }))

  const assets = [modelReference, collarReference, plaketReference, pocketReference]
    .filter((ref): ref is ReferenceImageDescriptor => !!ref)
    .sort((a, b) => b.priority - a.priority)
  const urls = [customerPhotoUrl, ...assets.map((ref) => ref.url)]

  return {
    customerPhotoUrl,
    modelReference,
    collarReference,
    plaketReference,
    pocketReference,
    urls,
    excluded,
    backgroundReferenceCount: 0,
    mannequinReferenceCount: 0,
  }
}

// Appends every applicable AI Asset instruction to a base prompt —
// SILHOUETTE-only caveat when a Model AI Asset is included, COLLAR_SHAPE-
// only caveat when a Collar AI Asset is included, PLAKET_SHAPE-only /
// POCKET_SHAPE-only caveats likewise. Any combination, or none, may apply;
// a render with no AI Asset at all gets no caveat, since there is nothing
// to caveat.
export function applyAssetInstructions(basePrompt: string, composed: ComposedAiAssets): string {
  let prompt = basePrompt
  if (composed.modelReference) prompt = `${prompt} ${MODEL_REFERENCE_SILHOUETTE_INSTRUCTION}`
  if (composed.collarReference) prompt = `${prompt} ${COLLAR_REFERENCE_SHAPE_INSTRUCTION}`
  if (composed.plaketReference) prompt = `${prompt} ${PLAKET_REFERENCE_SHAPE_INSTRUCTION}`
  if (composed.pocketReference) prompt = `${prompt} ${POCKET_REFERENCE_SHAPE_INSTRUCTION}`
  return prompt
}

// Reference-First (Sprint R-02) — the set of categories for which a real
// Hero Image was actually composed into THIS render's request. Derived
// straight from `composed` (already gated by isAiAssetActive above, via
// composeAiAssets) rather than re-checking approved/active/sourceImage a
// second, possibly diverging way. Prompt Builder/Compression use this to
// decide which categories' AI Design DNA can collapse to Lock Rules only
// (see promptBuilder/lockRules.ts) — a category absent from this set keeps
// getting its full DNA text exactly as before (Phase 4's "fallback",
// automatic by construction: nothing here can mark a category
// reference-backed without composeAiAssets first having included its
// image).
export function referenceBackedCategories(composed: ComposedAiAssets): Set<MasterDataCategory> {
  const categories = new Set<MasterDataCategory>()
  if (composed.modelReference) categories.add('model_thobe')
  if (composed.collarReference) categories.add('kerah')
  if (composed.plaketReference) categories.add('plaket')
  if (composed.pocketReference) categories.add('saku')
  return categories
}

export interface AiAssetValidation {
  valid: boolean
  reason: string
}

// The ONE validator both Model and Collar reference-availability checks
// funnel through (unifying what used to be two near-duplicate functions —
// see this sprint's report). `option` is the raw selected MasterDataOption
// (regardless of whether it resolved for text-DNA purposes — an AI Asset's
// availability is judged independently), `asset` is what composeAiAssets
// actually produced for it (null unless the 3-condition gate passed).
export function validateAiAssetAvailable(params: {
  option: MasterDataOption | null
  asset: ReferenceImageDescriptor | null
  label: string
}): AiAssetValidation {
  const { option, asset, label } = params

  if (asset) {
    return { valid: true, reason: `${label} tersedia (item ${asset.itemId}) — AI Design DNA approved, AI Asset ACTIVE.` }
  }
  if (!option) {
    return { valid: false, reason: `Tidak ada komponen untuk ${label} pada selection ini.` }
  }
  if (!option.is_active) {
    return { valid: false, reason: `"${option.name}" berstatus nonaktif di katalog — ${label} tidak tersedia.` }
  }
  if (option.ai_dna.status !== 'approved') {
    return {
      valid: false,
      reason: `"${option.name}" AI Design DNA belum approved (status saat ini: ${option.ai_dna.status}) — ${label} tidak tersedia. Approve dari Master Data Editor untuk mengaktifkan AI Asset ini.`,
    }
  }
  if (!option.ai_dna.metadata.sourceImage) {
    return { valid: false, reason: `"${option.name}" belum memiliki Hero Image (ai_dna.metadata.sourceImage kosong) — ${label} tidak tersedia.` }
  }
  return {
    valid: false,
    reason: `"${option.name}" Render Recipe masih berstatus empty — ${label} tidak tersedia sampai Render Recipe-nya dikonfigurasi.`,
  }
}

// "Model Reference tersedia -> PASS. Model Reference hilang -> FAIL. Tidak
// boleh mengirim render tanpa Model Reference." — deterministic, no AI.
export function validateModelReferenceAvailable(params: { modelThobeOption: MasterDataOption | null; composed: ComposedAiAssets }): AiAssetValidation {
  return validateAiAssetAvailable({ option: params.modelThobeOption, asset: params.composed.modelReference, label: 'Model Reference' })
}

// "PASS: image exists, reference type = COLLAR_REFERENCE, reference role =
// COLLAR_SHAPE, status = ACTIVE. FAIL: image missing, duplicate collar
// reference, wrong component, inactive asset." Unlike Model Reference, this
// is NEVER a render-blocking condition — a FAIL here just means the collar
// AI Asset is omitted (`collarReference` is already null in that case);
// the render proceeds on DNA alone. "Duplicate collar reference" is
// impossible-by-construction (see this file's header comment) rather than
// actually checked, since composeAiAssets only ever accepts one
// `collarOption` value.
export function validateCollarReference(params: { collarOption: MasterDataOption | null; composed: ComposedAiAssets }): AiAssetValidation {
  return validateAiAssetAvailable({ option: params.collarOption, asset: params.composed.collarReference, label: 'Collar Reference' })
}

// Same non-blocking semantics as validateCollarReference — a FAIL here just
// means plaketReference/pocketReference stay null and the render proceeds
// on DNA (text) alone (Sprint AI Stability Phase 2).
export function validatePlaketReference(params: { plaketOption: MasterDataOption | null; composed: ComposedAiAssets }): AiAssetValidation {
  return validateAiAssetAvailable({ option: params.plaketOption, asset: params.composed.plaketReference, label: 'Plaket Reference' })
}

export function validatePocketReference(params: { pocketOption: MasterDataOption | null; composed: ComposedAiAssets }): AiAssetValidation {
  return validateAiAssetAvailable({ option: params.pocketOption, asset: params.composed.pocketReference, label: 'Pocket Reference' })
}
