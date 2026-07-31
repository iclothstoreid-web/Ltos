import type { MasterDataCategory } from '@/lib/design/masterData'

// Reference-First Lock Rules (Sprint R-02) — for a category whose Hero
// Image is actually being sent to OpenAI as a visual reference this render
// (see aiAssetComposer/composer.ts's referenceBackedCategories), the
// narrative/visual-description sub-keys AI Design DNA contributes to
// RenderRecipe.garment — geometry / construction / appearance / materials /
// stitching (dnaResolver/resolver.ts's AI_DNA_GARMENT_FIELDS) — are
// redundant with what the photo itself already shows: shape, proportion,
// texture, finish. Dropping them from the text sent to GPT Image is exactly
// what the brief calls "Remove Redundant Visual Text."
//
// What survives is exactly what the brief calls Lock Rules:
//   - `placement`      (Placement Rule — WHERE it sits, not what it looks
//                        like; a photo alone can't convey exact anchor/
//                        offset/rotation the way "3.5cm from neck seam"
//                        does)
//   - `color`           (warna_bahan's DNA Resolver-renamed `appearance` —
//                        see resolver.ts's Color Identity carve-out; never
//                        narrative, always the customer's concrete choice,
//                        and a reference photo of a DIFFERENT component
//                        can't substitute for it)
//   - any other key NOT in the narrative list — e.g. a render_recipe.garment
//     override authored directly, which was never one of the 6 AI Design
//     DNA fields to begin with, so it's never assumed to be prose.
// `negativeRules` is not part of `garment` at all — it is a separate
// RenderRecipe/MasterRenderRecipe-level field, already unioned across every
// selected item and sent unconditionally regardless of reference-backed
// status (see recipeComposer/composer.ts and promptBuilder/compression.ts's
// buildVisualDescriptionContent) — nothing here needs to preserve it
// specially.
//
// This never touches the DB, the AI Design DNA schema, or Recipe Composer's
// merge/conflict logic — the full DNA is still generated, stored, and
// resolved exactly as before (Repository stays Single Source of Truth,
// per the R-01 blueprint). Only how much of it gets serialized to TEXT for
// a reference-backed category changes; the DNA Debug Viewer / Master Data
// Editor still shows every field untouched.
const NARRATIVE_GARMENT_KEYS: readonly string[] = ['geometry', 'construction', 'appearance', 'materials', 'stitching']

export function pruneToLockRules(garment: Record<string, unknown>): Record<string, unknown> {
  const kept: Record<string, unknown> = {}
  Object.entries(garment).forEach(([key, value]) => {
    if (NARRATIVE_GARMENT_KEYS.includes(key)) return
    kept[key] = value
  })
  return kept
}

// Applies pruneToLockRules only when `category` is in `referenceBacked` —
// every other category (the 7 with no Hero Image mechanism at all, or a
// reference-eligible category whose item simply isn't approved/active/
// configured for THIS render) passes `garment` through completely
// unchanged. This IS Phase 4's fallback: there is no separate "fallback
// path" to maintain — a category simply never enters `referenceBacked` in
// the first place unless composeAiAssets already decided its Hero Image is
// good enough to send, so nothing here can ever drop DNA content without a
// reference image actually standing in for it in the same request.
export function applyLockRulesIfReferenceBacked(
  garment: Record<string, unknown>,
  category: MasterDataCategory,
  referenceBacked: Set<MasterDataCategory>,
): Record<string, unknown> {
  return referenceBacked.has(category) ? pruneToLockRules(garment) : garment
}
