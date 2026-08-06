// Reference Usage Policy — Engine Section 3/7 (Prompt Architecture
// Realignment, 2026-08-06; content originally Global Reference Policy —
// Geometry, Sprint A 2026-08-05). Renamed file/export only — wording
// unchanged, storage-location move.
//
// States HOW to use a reference image, generically, for every geometry-type
// reference at once. Deliberately excludes what audit found to be genuine
// per-component content — the geometry attribute list ("Transfer only: ...")
// and the ignore list ("Do NOT copy: ...") — those stay with each
// component's own Component Rules (Collar/Placket/Pocket's own Prompt
// Builder step), never hoisted here.
//
// Repository Knowledge Migration Phase 1 (2026-08-06) — VERBATIM placement
// of the Prompt UAT block, byte-exact. This UAT text supersedes and
// resolves the ambiguity flagged in the prior "Final Repository Knowledge
// Migration" pass (that version's "Perlakukan gambar referensi ini sebagai
// konstruksi lengkap" read as a reversal of "do not treat as complete
// construction") — the current UAT text is a single, unambiguous sentence
// with no such reversal.
export const REFERENCE_USAGE_POLICY =
  'Setiap gambar referensi selain Foto Pelanggan menggambarkan bentuk dan geometri yg harus di ikuti mutlak kecuali warna.'
