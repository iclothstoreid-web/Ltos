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

// MODEL_THOBE (role SILHOUETTE) and COLLAR_REFERENCE (role COLLAR_SHAPE)
// are implemented. FABRIC_REFERENCE / EMBROIDERY_REFERENCE /
// PATTERN_REFERENCE remain reserved names with no composer logic, no role,
// no priority, and no caller anywhere in this codebase —
// composeAiAssets() never constructs a descriptor for them. Implementing
// one for real is a future sprint's job: its own ReferenceRole, its own
// REFERENCE_PRIORITY entry, a new optional input on ComposeAiAssetsInput,
// and its own inclusion rule in composeAiAssets — all additive, following
// the exact same shape COLLAR_REFERENCE did.
export type ReferenceType = 'MODEL_THOBE' | 'COLLAR_REFERENCE' | 'FABRIC_REFERENCE' | 'EMBROIDERY_REFERENCE' | 'PATTERN_REFERENCE'

// Each implemented reference type gets exactly one role, describing the
// ONLY dimension that type's AI Asset is allowed to contribute:
//   SILHOUETTE   (MODEL_THOBE) — overall silhouette/proportion/length/drape
//   COLLAR_SHAPE (COLLAR_REFERENCE) — collar outline/curvature/opening/
//                height/proportion/profile/geometry ONLY, never fabric/
//                color/stitching/lighting/background (those stay DNA-driven)
// A future FABRIC_REFERENCE/EMBROIDERY_REFERENCE/PATTERN_REFERENCE would
// each need their own role added here — none is guessed/invented in advance.
export type ReferenceRole = 'SILHOUETTE' | 'COLLAR_SHAPE'

// Priority mirrors "more specific overrides more generic" — same ordering
// principle recipeComposer/composer.ts already uses for text DNA (Model
// before Collar before Pocket). Only implemented types get a real entry; a
// future reference type must not silently default to 0 or inherit an
// existing type's number — give it its own deliberate entry when it is
// actually built.
export const REFERENCE_PRIORITY: Partial<Record<ReferenceType, number>> = {
  MODEL_THOBE: 100,
  COLLAR_REFERENCE: 90,
}

export interface ReferenceImageDescriptor {
  type: ReferenceType
  role: ReferenceRole
  priority: number
  itemId: string
  url: string
}
