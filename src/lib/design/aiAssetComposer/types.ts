// AI Asset Lifecycle (renamed from "Reference DNA Architecture" — was
// referenceComposer/, this sprint's brief: "Reference Composer diubah
// menjadi AI Asset Composer") — formalizes what a visual reference image
// ("AI Asset") is allowed to contribute to an AI render, as opposed to AI
// Design DNA / Render Recipe (text-only, per-component, already the source
// of truth for collar/cuff/pocket/placket/embroidery/button/fabric/color —
// see recipeComposer/composer.ts).
//
// AI Asset Type/Role/Priority vocabulary is unchanged from the prior turn
// (kept as-is, it already matched the brief's own field names) — only the
// COMPOSER (composer.ts) was renamed and re-gated this turn.

// COLLAR_REFERENCE (role COLLAR_SHAPE), PLAKET_REFERENCE (role
// PLAKET_SHAPE), and POCKET_REFERENCE (role POCKET_SHAPE) are implemented
// (PLAKET/POCKET added Sprint AI Stability Phase 2, mirroring
// COLLAR_REFERENCE exactly — see Phase 1 audit's Issue 1 / Priority 2 item
// 4). MODEL_THOBE (role SILHOUETTE) was removed in the Architecture Lock
// revision (2026-08-04) — Model Thobe no longer contributes any AI Asset;
// the render-quality-anchoring image it used to provide is now
// GLOBAL_BASE_HERO_IMAGE_URL (renderEngine/baseHero.ts), a Render Engine
// singleton inserted directly by route.ts, outside this registry/composer
// entirely (it isn't per-order, so it needs no gate here). FABRIC_REFERENCE
// / EMBROIDERY_REFERENCE / PATTERN_REFERENCE remain reserved names with no
// composer logic, no role, no priority, and no caller anywhere in this
// codebase — composeAiAssets() never constructs a descriptor for them.
// Implementing one for real is a future sprint's job: its own
// ReferenceRole, its own REFERENCE_PRIORITY entry, a new optional input on
// ComposeAiAssetsInput, and its own inclusion rule in composeAiAssets — all
// additive, following the exact same shape COLLAR_REFERENCE did.
export type ReferenceType =
  | 'COLLAR_REFERENCE'
  | 'PLAKET_REFERENCE'
  | 'POCKET_REFERENCE'
  | 'FABRIC_REFERENCE'
  | 'EMBROIDERY_REFERENCE'
  | 'PATTERN_REFERENCE'

// Each implemented reference type gets exactly one role, describing the
// ONLY dimension that type's AI Asset is allowed to contribute:
//   COLLAR_SHAPE (COLLAR_REFERENCE) — collar outline/curvature/opening/
//                height/proportion/profile/geometry ONLY, never fabric/
//                color/stitching/lighting/background (those stay DNA-driven)
//   PLAKET_SHAPE (PLAKET_REFERENCE) — placket outline/opening length/button
//                spacing/stitch-line geometry ONLY
//   POCKET_SHAPE (POCKET_REFERENCE) — pocket outline/placement/proportion
//                geometry ONLY
// A future FABRIC_REFERENCE/EMBROIDERY_REFERENCE/PATTERN_REFERENCE would
// each need their own role added here — none is guessed/invented in advance.
export type ReferenceRole = 'COLLAR_SHAPE' | 'PLAKET_SHAPE' | 'POCKET_SHAPE'

// Priority mirrors "more specific overrides more generic" — same ordering
// principle recipeComposer/composer.ts already uses for text DNA. Only
// implemented types get a real entry; a future reference type must not
// silently default to 0 or inherit an existing type's number — give it its
// own deliberate entry when it is actually built.
export const REFERENCE_PRIORITY: Partial<Record<ReferenceType, number>> = {
  COLLAR_REFERENCE: 90,
  PLAKET_REFERENCE: 80,
  POCKET_REFERENCE: 70,
}

export interface ReferenceImageDescriptor {
  type: ReferenceType
  role: ReferenceRole
  priority: number
  itemId: string
  url: string
}
