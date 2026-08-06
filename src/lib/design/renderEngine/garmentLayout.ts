// Garment Layout — Engine Section 5/7 (Prompt Architecture Realignment,
// 2026-08-06; content originally Global Render Policy's lockRules half,
// Render Engine Knowledge Refactor 2026-08-04). Wording unchanged from
// GLOBAL_RENDER_POLICY_LOCK_RULES — only the storage location and the fact
// that it is now a standalone Engine section (rather than one half of a
// lockRules/negativeRules pair) changed.
//
// Responsibility is strictly GARMENT CONSTRAINT — geometry/proportion/
// construction/component placement/component presence — never a quality
// target (Global Quality Rules' job), never lighting/camera/composition
// (Scene Configuration's job), never per-component geometry (each
// component's own Component Rules, at that component's own Prompt Builder
// step). The negative-form mirror of this same policy is Final Constraints
// (finalConstraints.ts), positioned last in the prompt rather than adjacent
// to this section — Engine, not Component, per the locked architecture;
// components no longer contribute to a shared global pool at all (see
// recipeComposer/composer.ts).
//
// Final Repository Knowledge Migration (2026-08-06) — FULL REPLACE per
// latest Prompt UAT (Indonesian).
export const GARMENT_LAYOUT_RULES: string[] = [
  'Seluruh badan pakaian melingkari batang tubuh sepenuhnya.',
  'Lengan.',
  'Panjang badan.',
  'Potongan slim (relaxed fit) yang mempertahankan bentuk.',
  'Jatuhan kain (drape) alami di sekitar tubuh.',
  'Tidak melekat ketat.',
]
