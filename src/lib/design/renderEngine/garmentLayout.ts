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
// Repository Knowledge Migration Phase 1 (2026-08-06) — VERBATIM placement
// of the Prompt UAT block, byte-exact. The UAT text for this section is a
// single flowing block with its own embedded "penempatan:"/
// "posisi_pada_pakaian:"/"hubungan_dengan_tubuh:" labels (the same
// placement-object key names individual components' own ai_dna.placement
// use) rather than the short bare phrases the prior "Final Repository
// Knowledge Migration" pass stored — kept as ONE array item (not split into
// several) so promptBuilder/compression.ts's `Preserve: ${rules.join(',
// ')}.` wrapper cannot alter the UAT's own internal comma placement.
export const GARMENT_LAYOUT_RULES: string[] = [
  'penempatan: posisi_pada_pakaian: Seluruh badan pakaian - melingkari batang tubuh sepenuhnya, lengan, dan panjang badan, hubungan_dengan_tubuh: Potongan slim (relaxed fit) yang mempertahankan bentuk, jatuhan kain (drape) alami di sekitar tubuh, tidak melekat ketat.',
]
