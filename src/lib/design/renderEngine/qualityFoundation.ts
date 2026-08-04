// Quality Foundation (Render Engine Knowledge Refactor, 2026-08-04) — ONE of
// 4 sibling Render Engine concerns (alongside Base Hero Model, Global Render
// Policy, Global Render Recipe — see baseHero.ts/globalRenderPolicy.ts/
// globalRenderRecipe.ts in this directory). Responsibility is strictly
// render QUALITY TARGET — what "good" looks like in the abstract — never
// geometry/proportion/silhouette/component placement (Global Render
// Policy's job), never material thickness/fabric tension (no Engine layer
// owns per-material physical behaviour — that is Material/Component
// Knowledge's job, once it exists, not invented here), never lighting/
// camera/composition/shadow (Global Render Recipe's job).
//
// Previously this content lived split across two places that both
// overlapped in meaning: `aiDna/types.ts`'s DEFAULT_LOCK_RULES (several
// "Preserve realistic ..." texture/finish lines) and
// `recipeComposer/types.ts`'s DEFAULT_GLOBAL_RENDER_POLICY.lockRules/
// negativeRules (labelled "Quality Foundation" there, mixed with geometry/
// structure/camera/identity content that belongs to other layers). Both
// sources are retired; this is the single, minimal replacement — exactly
// the 5 lines the locked brief specifies, nothing added.
export const QUALITY_FOUNDATION: string[] = [
  'Photorealistic commercial-quality garment.',
  'Natural textile appearance.',
  'Clean tailoring craftsmanship.',
  'Realistic surface and fabric interaction.',
  'Free from AI rendering artifacts.',
]
