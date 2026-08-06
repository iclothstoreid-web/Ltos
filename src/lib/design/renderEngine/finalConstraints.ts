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
//
// Final Repository Knowledge Migration (2026-08-06) — FULL REPLACE per
// latest Prompt UAT (Indonesian). Each line of the UAT brief (including its
// "KRITIS:"/"HINDARI:" section labels and the "JANGAN disalin:" sub-list)
// becomes its own array item, in the exact given order — no merging,
// reformatting, or summarizing. Serializer/compression wrap this array as
// `Avoid: ${rules.join(', ')}.` (promptBuilder/compression.ts's
// buildFinalConstraintsContent) — unchanged, Pipeline is locked.
export const FINAL_CONSTRAINTS: string[] = [
  'KRITIS:',
  'JANGAN membuat selain yg diminta.',
  'Buat persis dengan tepat seperti di gambar dan perintah.',
  'JANGAN buat komponen yang tidak dipilih.',
  'Jangan lepaskan komponen yang dipilih.',
  'JANGAN mengubah selain yg diperintahkan.',
  'JANGAN disalin:',
  '- tekstur kain',
  '- warna kain',
  '- latar belakang',
  '- gaya fotografi',
  'JANGAN menimpa tekstur dengan efek buatan.',
  'JANGAN menambahkan kerutan, lipatan, atau distorsi.',
  'JANGAN menambahkan detail yang tidak realistis.',
  'JANGAN gagal menampilkan tepi secara bersamaan dengan fokus yang tajam.',
  'JANGAN menampilkan perkiraan atau penyederhanaan.',
  'JANGAN terlalu mencerahkan atau terlalu menggelapkan sehingga mengurangi kejelasan tepi.',
  'HINDARI:',
  'Garis bayangan yang kasar di dasar.',
  'Tidak menyatu dengan badan.',
  'Tidak ada yang mengambang.',
  'Buat sealami mungkin seperti pakaian.',
  'Pertahankan geometri pakaian.',
  'Pertahankan proporsi pakaian.',
  'Pertahankan konstruksi pakaian.',
  'Pertahankan penempatan komponen yang dipilih.',
  'Pertahankan detail komponen yang dipilih.',
]
