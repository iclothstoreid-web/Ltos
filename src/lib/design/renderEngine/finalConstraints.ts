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
// Repository Knowledge Migration Phase 1 (2026-08-06) — VERBATIM placement
// of the Prompt UAT block, byte-exact, replacing the prior "Final Repository
// Knowledge Migration" pass's 27-item array (which had normalized every
// line to end in a clean period, split on the source's own paragraph breaks,
// and silently fixed "buat se alami" -> "sealami"). Kept as ONE array item
// (not split per line) so promptBuilder/compression.ts's
// `Avoid: ${rules.join(', ')}.` wrapper cannot alter the UAT's own mixed
// comma/period punctuation (including its literal ".," sequences and the
// space before "HINDARI :"). Two things flagged per instruction, left
// exactly as given, not fixed: "JANGAN menambahkan detail yang tidak
// realistis." appears twice (genuine duplicate in the source), and "buat se
// alami mungkin seperti pakaian" (likely meant "sealami") is preserved with
// its original spacing.
export const FINAL_CONSTRAINTS: string[] = [
  'KRITIS: JANGAN membuat selain yg diminta.Buat persis dengan tepat seperti di gambar dan perintah. JANGAN buat komponen yang tidak dipilih, Jangan lepaskan komponen yang dipilih. JANGAN mengubah selain yg di perintahkan, JANGAN disalin: tekstur kain, warna kain,latar belakang, gaya fotografi. JANGAN menimpa tekstur dengan efek buatan, JANGAN menambahkan kerutan, lipatan, atau distorsi, JANGAN menambahkan detail yang tidak realistis. JANGAN gagal menampilkan tepi secara bersamaan dengan fokus yang tajam., JANGAN menampilkan perkiraan atau penyederhanaan — keseluruhan harus tepat., JANGAN terlalu mencerahkan atau terlalu menggelapkan sehingga mengurangi kejelasan tepi. JANGAN menambahkan detail yang tidak realistis. HINDARI : Garis bayangan yang kasar di dasar, tidak menyatu dengan badan, tidak ada yang mengambang, buat se alami mungkin seperti pakaian, Pertahankan geometri pakaian., Pertahankan proporsi pakaian., Pertahankan konstruksi pakaian., Pertahankan penempatan komponen yang dipilih., Pertahankan detail komponen yang dipilih.',
]
