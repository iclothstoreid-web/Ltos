// Reference Binding — Engine Section 2/4 (Prompt UAT Source of Truth
// realignment, this sprint). Static, global, unconditional — new UAT
// wording, byte-exact placement, no rewrite/paraphrase.
//
// Behavior change from the prior architecture: Reference Binding used to be
// built dynamically from which images were actually active this render (a
// role not attached was simply omitted). The new Prompt UAT gives a fixed
// 6-line list with no conditionality instruction, under the same "Static,
// global, never derived from Master Data" rule Identity Lock already
// follows — so this is now always emitted in full, regardless of which
// components/references are actually attached to a given render.
export const REFERENCE_BINDING =
  'Foto pelanggan = identitas, tubuh, pose, pencahayaan, perspektif, dan background. Base Hero = siluet thobe. Kerah = bentuk kerah. Plaket = bentuk plaket. Saku = bentuk saku. Manset = bentuk manset.'
