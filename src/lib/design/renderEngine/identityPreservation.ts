// Identity Preservation — Engine Section 1/7 (Prompt Architecture Realignment,
// 2026-08-06). Static, global, never derived from Master Data. Moved here
// verbatim from promptArchitectureV2/layers.ts's LAYER1_IDENTITY_TEMPLATE
// (Sprint AI-R2.5 origin, strengthened 2026-08-03) — that module was a
// parallel comparison path (V1 vs V2) that never became production and is
// retired by this refactor; this constant is the one piece of it that WAS
// already load-bearing in production (route.ts's identityTemplate input),
// so it survives the move with its wording completely unchanged.
export const IDENTITY_PRESERVATION = [
  "Preserve the customer's identity exactly.",
  'Do not modify facial features, facial expression, hairstyle, skin tone, age, beard, body, body proportions, pose, perspective, lighting, or background.',
  "Do not beautify or enhance the customer's appearance: no skin smoothing, no facial retouching, no idealized or improved features.",
  'Only replace clothing.',
].join(' ')
