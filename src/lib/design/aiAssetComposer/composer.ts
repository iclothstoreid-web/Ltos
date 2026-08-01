import { MASTER_DATA_CATEGORIES, type MasterDataCategory, type MasterDataOption } from '@/lib/design/masterData'
import type { ReferenceImageDescriptor } from './types'
import { REFERENCE_CATEGORY_REGISTRY } from './registry'
// Re-exported for backward compatibility — every existing caller (route.ts,
// the DNA Debug Viewer) imports these instruction constants from this
// module. Sprint R-05 moved their canonical definition into registry.ts
// (the Category Registry, Phase 3) so they live alongside the rest of each
// category's metadata (type/role/priority) instead of only here; nothing
// about their content or callers changed.
export {
  MODEL_REFERENCE_SILHOUETTE_INSTRUCTION,
  COLLAR_REFERENCE_SHAPE_INSTRUCTION,
  PLAKET_REFERENCE_SHAPE_INSTRUCTION,
  POCKET_REFERENCE_SHAPE_INSTRUCTION,
} from './registry'

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
  /** Sprint R-05 (Phase 2/3) — the same 4 descriptors above, keyed by
   *  category instead of by name. This is the ONE generic place every other
   *  "which categories have an active Hero Image right now" question gets
   *  answered from (referenceBackedCategories, applyAssetInstructions,
   *  route.ts's asset-instruction-layer construction) — the named fields
   *  above are kept only for existing callers (e.g. the DNA Debug Viewer)
   *  that already read them by name; nothing new should be built against
   *  them, prefer this map instead. */
  referencesByCategory: ReadonlyMap<MasterDataCategory, ReferenceImageDescriptor>
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

// Sprint R-05 (Phase 1/3) — replaces 4 near-identical hardcoded blocks (one
// per category, each repeating the same isAiAssetActive-then-build-
// descriptor shape) with one loop over REFERENCE_CATEGORY_REGISTRY. Adding
// a 5th reference-eligible category no longer means adding a 5th copy of
// this block — see registry.ts's header comment.
export function composeAiAssets(input: ComposeAiAssetsInput): ComposedAiAssets {
  const { customerPhotoUrl, modelThobeOption, collarOption = null, plaketOption = null, pocketOption = null, otherSelectedCategories } = input

  const optionByCategory: Partial<Record<MasterDataCategory, MasterDataOption | null>> = {
    model_thobe: modelThobeOption,
    kerah: collarOption,
    plaket: plaketOption,
    saku: pocketOption,
  }

  const referencesByCategory = new Map<MasterDataCategory, ReferenceImageDescriptor>()
  REFERENCE_CATEGORY_REGISTRY.forEach((def) => {
    const option = optionByCategory[def.category] ?? null
    if (!isAiAssetActive(option)) return
    referencesByCategory.set(def.category, {
      type: def.type,
      role: def.role,
      priority: def.priority,
      itemId: option!.id,
      url: option!.ai_dna.metadata.sourceImage!,
    })
  })

  const modelReference = referencesByCategory.get('model_thobe') ?? null
  const collarReference = referencesByCategory.get('kerah') ?? null
  const plaketReference = referencesByCategory.get('plaket') ?? null
  const pocketReference = referencesByCategory.get('saku') ?? null

  // kerah/plaket/saku stay in `excluded` (still text-only, per Recipe
  // Composer) unless their real reference was actually composed in for
  // THIS render.
  const excludedCategorySet = new Set(otherSelectedCategories ?? NON_REFERENCE_CATEGORIES)
  referencesByCategory.forEach((_descriptor, category) => excludedCategorySet.delete(category))
  const excluded: ExcludedReferenceCategory[] = Array.from(excludedCategorySet).map((category) => ({
    category,
    reason:
      'Component DNA (AI Design DNA / Render Recipe) is the source of truth for this category — it is described to GPT Image as text via Recipe Composer/Prompt Builder, never as an image reference.',
  }))

  const assets = Array.from(referencesByCategory.values()).sort((a, b) => b.priority - a.priority)
  const urls = [customerPhotoUrl, ...assets.map((ref) => ref.url)]

  return {
    customerPhotoUrl,
    modelReference,
    collarReference,
    plaketReference,
    pocketReference,
    referencesByCategory,
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
// to caveat. Sprint R-05 — loops over the registry (declared Model > Collar
// > Plaket > Pocket, the same order this always appended in) instead of 4
// hardcoded `if` statements.
export function applyAssetInstructions(basePrompt: string, composed: ComposedAiAssets): string {
  let prompt = basePrompt
  REFERENCE_CATEGORY_REGISTRY.forEach((def) => {
    if (composed.referencesByCategory.has(def.category)) prompt = `${prompt} ${def.instruction}`
  })
  return prompt
}

// Reference-First — the set of categories for which a real Hero Image was
// actually composed into THIS render's request. Derived straight from
// `composed.referencesByCategory` (already gated by isAiAssetActive above,
// via composeAiAssets) rather than re-checking approved/active/sourceImage
// a second, possibly diverging way. Consumed by route.ts to decide which AI
// Asset caveat instruction layers apply and for debug logging — no longer
// used to prune AI Design DNA text (Reference-First Cleanup removed the
// narrative fields that pruning used to target).
export function referenceBackedCategories(composed: ComposedAiAssets): Set<MasterDataCategory> {
  return new Set(composed.referencesByCategory.keys())
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
