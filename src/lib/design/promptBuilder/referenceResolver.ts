import type { MasterDataCategory } from '@/lib/design/masterData'

// Reference Resolver (Sprint R-02, formalized as the single Resolver Sprint
// R-05 Phase 2 requires) — the ONLY place in this codebase allowed to
// decide what a category's garment text looks like once Hero Image status
// is known. Before this sprint, `builder.ts`'s buildRenderInstruction hand-
// rolled its own copy of the exact same "is this category referenceBacked
// -> prune, else pass through" check instead of calling
// applyLockRulesIfReferenceBacked below — two implementations of one
// decision, which is exactly the "pengecekan status Hero Image di banyak
// file berbeda" Phase 2 rules out. That duplicate is now gone: both real
// callers (promptBuilder/compression.ts's formatEntryContent — the
// production path — and promptBuilder/builder.ts's buildRenderInstruction
// — the diagnostic-only path) call applyLockRulesIfReferenceBacked, and
// nothing else in this codebase calls pruneToLockRules directly.
//
// This module does NOT decide which categories have an active Hero Image —
// that stays aiAssetComposer/composer.ts's job (isAiAssetActive,
// referenceBackedCategories), reached only through the `referenceBacked`
// Set every caller here already receives as a parameter. Two focused,
// single-responsibility modules cooperating through one typed value (a
// `Set<MasterDataCategory>`), not one module re-implementing the other.
//
// ---------------------------------------------------------------------
// Lock Rule Contract (Sprint R-05, Phase 4)
// ---------------------------------------------------------------------
// Every category's `garment` record is built from the same 6 AI Design DNA
// fields (dnaResolver/resolver.ts's AI_DNA_GARMENT_FIELDS: geometry/
// construction/appearance/materials/stitching/placement) plus whatever a
// Render Recipe override adds directly. Lock Rules are defined once, as one
// fixed list (NARRATIVE_GARMENT_KEYS below), applied identically to every
// category — there is no per-category variant, no category-specific key
// list, no special case anywhere in this codebase. What survives pruning is
// always exactly:
//   - `placement`   (WHERE it sits — a photo can't convey "3.5cm from neck
//                    seam" the way this key's text does)
//   - `color`       (warna_bahan's DNA Resolver-renamed `appearance` — see
//                    resolver.ts's Color Identity carve-out; a photo of a
//                    DIFFERENT component can never substitute for the
//                    customer's own concrete color choice)
//   - any other key NOT in the narrative list (e.g. a render_recipe.garment
//     override authored directly, never one of the 6 AI Design DNA fields)
// `negativeRules` is not part of `garment` at all — see compression.ts's
// buildNegativeRulesContent; nothing here needs to preserve it specially.
//
// This never touches the DB, the AI Design DNA schema, or Recipe Composer's
// merge/conflict logic — the full DNA is still generated, stored, and
// resolved exactly as before (Repository stays Single Source of Truth, per
// the R-01 blueprint). Only how much of it gets serialized to TEXT for a
// reference-backed category changes; the DNA Debug Viewer / Master Data
// Editor still show every field untouched.
const NARRATIVE_GARMENT_KEYS: readonly string[] = ['geometry', 'construction', 'appearance', 'materials', 'stitching']

export function pruneToLockRules(garment: Record<string, unknown>): Record<string, unknown> {
  const kept: Record<string, unknown> = {}
  Object.entries(garment).forEach(([key, value]) => {
    if (NARRATIVE_GARMENT_KEYS.includes(key)) return
    kept[key] = value
  })
  return kept
}

// ---------------------------------------------------------------------
// Fallback Contract (Sprint R-05, Phase 5)
// ---------------------------------------------------------------------
//   Reference tersedia      -> pruneToLockRules(garment)
//   Reference tidak tersedia -> garment (unchanged)
// One rule, one implementation, no per-category variation — this function
// IS the contract; every caller (production and diagnostic alike) must
// route through it rather than re-deciding the same branch itself. A
// category simply never enters `referenceBacked` in the first place unless
// aiAssetComposer/composer.ts's composeAiAssets already decided its Hero
// Image is good enough to send, so nothing here can ever drop DNA content
// without a reference image actually standing in for it in the same
// request — there is no separate "fallback path" to maintain or drift out
// of sync, because there is no second implementation of this branch
// anywhere in the codebase.
export function applyLockRulesIfReferenceBacked(
  garment: Record<string, unknown>,
  category: MasterDataCategory,
  referenceBacked: Set<MasterDataCategory>,
): Record<string, unknown> {
  return referenceBacked.has(category) ? pruneToLockRules(garment) : garment
}
