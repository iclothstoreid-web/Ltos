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
// Final Repository Knowledge Migration (2026-08-06) — FULL REPLACE per
// latest Prompt UAT. NOTE (flagged in this sprint's report, not silently
// "corrected"): sentence 3 below reads as a reversal of the prior English
// wording's "Do not treat these reference images as the complete
// construction" — the UAT text has no "Jangan" before "Perlakukan ...
// sebagai konstruksi lengkap." Implemented literally as given (no wording
// invented), since a reversal may be intentional; verify against source.
export const REFERENCE_USAGE_POLICY =
  'Setiap gambar referensi selain Foto Pelanggan HANYA menggambarkan bentuk dan geometri komponen yang direferensikan, atau untuk Hero Dasar, siluet pakaian. Hasilnya tetap harus mengikuti DNA Desain AI yang dipilih. Perlakukan gambar referensi ini sebagai konstruksi lengkap. Konstruksi Standar yang diwarisi dari setiap komponen tetap berlaku.'
