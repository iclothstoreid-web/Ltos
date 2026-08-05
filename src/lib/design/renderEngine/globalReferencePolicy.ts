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
//
// Priority 0 Budget Reserve (2026-08-05) — two changes, both scoped to
// this one constant, no responsibility added beyond "HOW TO USE a
// reference image":
//   1. The prior wording opened and closed with the same claim ("provided
//      ONLY to describe ... shape and geometry" / "is only a geometric
//      guide for the component's shape") — a verbatim-restated sentence
//      with zero new information. Collapsed to state it once.
//   2. Base Hero's own reference-usage instruction ("use only silhouette,
//      ignore the person shown") had no textual home after the Reference
//      Binding Responsibility Cleanup sprint stripped it out of
//      REFERENCE_BINDING_MAP for violating that layer's one-question
//      scope (WHICH IMAGE, not HOW). This layer already answers HOW TO
//      USE a reference image for geometry — Base Hero's silhouette is
//      the same question, generalized from "component" to "component or
//      whole-garment silhouette," so it belongs here, not a new layer.
//      route.ts widens this layer's gate to fire whenever Base Hero is
//      active, not only when a Collar/Plaket/Pocket reference is.
//   3. Collar/Cuff/Plaket/Pocket's own ai_dna.negativeRules (Master Data,
//      not this file) each repeated the same 2-line boilerplate verbatim,
//      only the component noun differing: "Do not interpret the Hero
//      Image as the complete {X}." and "Do not modify the inherited
//      Standard {X} construction." Same shape as point 1 above, just
//      living in per-item data instead of a shared code constant. Stated
//      here ONCE instead, generically; the accompanying migration removes
//      those 2 lines from each of the 4 rows, keeping each row's own
//      genuinely per-item "...Standard {X} dimensions." line untouched.
export const GLOBAL_REFERENCE_POLICY_GEOMETRY =
  "The attached reference image describes ONLY shape and geometry — the referenced component's, or for Base Hero, the garment's silhouette. Ignore any person shown in the image. The result must still follow the selected AI Design DNA. Do not treat the reference image as the complete construction — the component's inherited Standard construction still applies."
