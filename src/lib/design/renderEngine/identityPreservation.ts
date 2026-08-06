// Identity Preservation — Engine Section 1/7 (Prompt Architecture Realignment,
// 2026-08-06). Static, global, never derived from Master Data.
//
// Repository Knowledge Migration Phase 1 (2026-08-06) — VERBATIM placement
// of the Prompt UAT block, byte-exact (Source of Truth; no rewrite, no
// paraphrase, no punctuation normalization). Supersedes the prior "Final
// Repository Knowledge Migration" pass, which had incorrectly added a space
// after the first sentence's commas and split "Hanya ganti pakaian." into
// its own array item — both fixed here to match the UAT text exactly.
export const IDENTITY_PRESERVATION = [
  'Pertahankan identitas pelanggan secara persis,tampilkan secara alami dan apa adanya,tampilkan background foto customer.',
  'Jangan memodifikasi fitur wajah, ekspresi wajah, gaya rambut, warna kulit, usia, janggut, tubuh, proporsi tubuh, tinggi dan pose, perspektif, pencahayaan, atau latar belakang.',
  'Jangan mempercantik atau meningkatkan penampilan pelanggan: tidak ada penghalusan kulit, tidak ada retouching wajah, tidak ada fitur yang diidealkan atau diperbaiki. Hanya ganti pakaian.',
].join(' ')
