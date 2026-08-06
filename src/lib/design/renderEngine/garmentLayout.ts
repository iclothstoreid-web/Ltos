// Garment Layout — Engine Section 5/7 (Prompt Architecture Realignment,
// 2026-08-06; content originally Global Render Policy's lockRules half,
// Render Engine Knowledge Refactor 2026-08-04). Wording unchanged from
// GLOBAL_RENDER_POLICY_LOCK_RULES — only the storage location and the fact
// that it is now a standalone Engine section (rather than one half of a
// lockRules/negativeRules pair) changed.
//
// Responsibility is strictly GARMENT CONSTRAINT, stated positively —
// geometry/proportion/construction/component placement/component presence —
// never a quality target (Global Quality Rules' job), never lighting/camera/
// composition/shadow (Scene Configuration's job), never per-component
// geometry (each component's own Component Rules, at that component's own
// Prompt Builder step). The negative-form mirror of this same policy is
// Final Constraints (finalConstraints.ts), positioned last in the prompt
// rather than adjacent to this section — Engine, not Component, per the
// locked architecture; components no longer contribute to a shared global
// pool at all (see recipeComposer/composer.ts).
export const GARMENT_LAYOUT_RULES: string[] = [
  'Preserve garment geometry.',
  'Preserve garment proportions.',
  'Preserve garment construction.',
  'Preserve selected component placement.',
  'Preserve selected component details.',
]
