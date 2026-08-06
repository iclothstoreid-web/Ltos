// Identity Preservation — Engine Section 1/7 (Prompt Architecture Realignment,
// 2026-08-06). Static, global, never derived from Master Data. Moved here
// verbatim from promptArchitectureV2/layers.ts's LAYER1_IDENTITY_TEMPLATE
// (Sprint AI-R2.5 origin, strengthened 2026-08-03) — that module was a
// parallel comparison path (V1 vs V2) that never became production and is
// retired by this refactor; this constant is the one piece of it that WAS
// already load-bearing in production (route.ts's identityTemplate input),
// so it survives the move with its wording completely unchanged.
//
// Background Preservation (Final UI & Prompt Adjustment, 2026-08-08) — the
// original 4 sentences already listed "background" among the things the
// second sentence forbids modifying, but only as one word inside a long
// enumeration. Strengthened in place (same "strengthened in place" pattern
// as the 2026-08-03 revision above, same always-applied Priority 0 slot,
// no change to section/order/pipeline): the customer's original background
// is now its own dedicated instruction, with every specific forbidden
// action spelled out, so it carries the same weight as face/body identity
// instead of riding along inside a generic list.
export const IDENTITY_PRESERVATION = [
  "Preserve the customer's identity exactly.",
  'Do not modify facial features, facial expression, hairstyle, skin tone, age, beard, body, body proportions, pose, perspective, lighting, or background.',
  "Do not beautify or enhance the customer's appearance: no skin smoothing, no facial retouching, no idealized or improved features.",
  "Preserve the customer's original background exactly — the background is part of Identity Preservation.",
  'Do not replace the background, remove the background, generate a studio background, generate a new background, change the background perspective, or change the background lighting.',
  'Only replace clothing.',
].join(' ')
