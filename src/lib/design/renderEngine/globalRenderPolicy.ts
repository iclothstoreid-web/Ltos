// Global Render Policy (Render Engine Knowledge Refactor, 2026-08-04) — ONE
// of 4 sibling Render Engine concerns (see qualityFoundation.ts's header for
// the full sibling list). Responsibility is strictly GARMENT CONSTRAINT —
// geometry/proportion/construction/component placement/component presence —
// never a quality target (Quality Foundation's job), never lighting/camera/
// composition/shadow (Global Render Recipe's job), never per-material
// behaviour (no Engine layer owns that).
//
// Consolidates what used to be TWO separate, overlapping Engine-default
// sources, both merged unconditionally into every render's masterRecipe:
//   - `aiDna/types.ts`'s DEFAULT_LOCK_RULES/DEFAULT_NEGATIVE_RULES ("Identity
//     Knowledge" per that file's own comment — in practice mostly garment-
//     geometry/structure content, i.e. this layer's actual domain, plus
//     several lines that duplicated Identity Lock's own template verbatim:
//     "Do not change customer identity/body shape/facial structure/skin
//     tone/perspective" — Identity Lock (promptArchitectureV2/layers.ts's
//     LAYER1_IDENTITY_TEMPLATE) already states all of this; those lines are
//     retired here as exact/semantic duplicates, not moved).
//   - `recipeComposer/types.ts`'s DEFAULT_GLOBAL_RENDER_POLICY.lockRules/
//     negativeRules — besides real garment-structure content (now folded
//     in below), this also carried: quality-target lines (moved to Quality
//     Foundation), Model-Thobe-Anchor-era garment-type enumeration
//     ("thobe replaced by shirt, polo, hoodie...", "short sleeves, low
//     collar, non-Saudi silhouette" — retired: Model Thobe is catalog-only
//     since the 2026-08-04 Architecture Lock, and a truly global policy
//     must not hardcode one garment family's silhouette), and
//     "camera, lighting, background changed" (retired: now redundant once
//     Global Render Recipe positively specifies the scene instead of
//     relying on a negative catch-all for fields that used to be empty).
//
// Only ONE knowledge source now feeds Recipe Composer's Engine-level
// lockRules/negativeRules merge (composer.ts's composeRenderRecipe) — no
// content lives in two layers at once.
export const GLOBAL_RENDER_POLICY_LOCK_RULES: string[] = [
  'Preserve garment geometry.',
  'Preserve garment proportions.',
  'Preserve garment construction.',
  'Preserve selected component placement.',
  'Preserve selected component details.',
]

export const GLOBAL_RENDER_POLICY_NEGATIVE_RULES: string[] = [
  'Do not generate unselected components.',
  'Do not remove selected components.',
  'Do not distort garment structure.',
]
