// Global Reference Policy — Geometry (Sprint A, Reference Policy Refactor,
// 2026-08-05) — ONE of the Render Engine's sibling concerns (alongside Base
// Hero Model/Quality Foundation/Global Render Policy/Global Render Recipe —
// see qualityFoundation.ts's header for the full sibling list). Priority 0
// audit (2026-08-05) found the 3 geometry-type AI Asset Instructions
// (Collar/Plaket/Pocket, aiAssetComposer/registry.ts) repeated the same
// 3-sentence framing boilerplate verbatim, only the component noun
// differing — 248 tokens paid across 3 separate layers for content that is
// identical in intent. This constant is that shared framing, generalized to
// a component-neutral noun ("the referenced component") so it can be sent
// ONCE per render (as its own Priority 0 layer, route.ts) instead of once
// per active geometry-type reference. Meaning is unchanged: which component
// a given reference image describes is still unambiguous downstream — each
// category's own Component Reference Delta (registry.ts) names its
// component repeatedly in its own geometry/ignore lists.
//
// Deliberately excludes what audit found to be genuine per-category
// content, never hoisted here: the geometry attribute list ("Transfer
// only: ...") and the ignore list ("Do NOT copy: ..." — verified NOT
// identical across categories: Collar says "stitching", Plaket/Pocket say
// "stitching thread color") — both stay Component Reference Delta.
export const GLOBAL_REFERENCE_POLICY_GEOMETRY =
  "The attached reference image is provided ONLY to describe the referenced component's shape and geometry. The component must still follow the selected AI Design DNA. This reference is only a geometric guide for the component's shape."
