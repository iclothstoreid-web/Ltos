// Final Constraints — Engine Section 7/7 (Prompt Architecture Realignment,
// 2026-08-06; content originally Global Render Policy's negativeRules half,
// Render Engine Knowledge Refactor 2026-08-04). Wording unchanged from
// GLOBAL_RENDER_POLICY_NEGATIVE_RULES — only the storage location and
// position in the assembled prompt changed: this is now the LAST section
// Prompt Builder emits (step 13/13), a final negative-constraint safety net
// stated right before the prompt ends, instead of living adjacent to
// Garment Layout's positive framing.
//
// Responsibility is strictly the negative mirror of Garment Layout — what
// must never happen to the garment as a whole. Never a per-component
// constraint (each component's own Component Rules, at that component's own
// Prompt Builder step).
export const FINAL_CONSTRAINTS: string[] = [
  'Do not generate unselected components.',
  'Do not remove selected components.',
  'Do not distort garment structure.',
]
