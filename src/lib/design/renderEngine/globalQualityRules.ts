// Global Quality Rules — Engine Section 6/7 (Prompt Architecture Realignment,
// 2026-08-06; content originally Quality Foundation, Render Engine Knowledge
// Refactor 2026-08-04). Renamed file/export only — wording unchanged,
// storage-location move.
//
// Responsibility is strictly render QUALITY TARGET — what "good" looks like
// in the abstract — never geometry/proportion/silhouette/component placement
// (Garment Layout / Final Constraints' job), never material thickness/fabric
// tension (Material's own Component Rules), never lighting/camera/
// composition (Scene Configuration's job).
//
// Final Repository Knowledge Migration (2026-08-06) — FULL REPLACE per
// latest Prompt UAT (Indonesian).
export const GLOBAL_QUALITY_RULES: string[] = [
  'Jangan merusak struktur pakaian.',
  'Jangan membuat bayangan kasar yang mengaburkan detail kain.',
  'Jangan membuat silau atau highlight yang berlebihan.',
  'Jangan membuat kain menjadi satu warna datar. Harus menunjukkan dimensi tekstur.',
  'Jangan menimpa pencahayaan dengan pantulan yang tidak realistis.',
  'Jangan membuat kerutan atau lipatan yang tidak alami.',
  'Jangan mengubah pola kain atau struktur tenun.',
  'Jangan membuat kain menjadi mengkilap atau terlalu mengkilat.',
  'Jangan membuat tampilan kaku atau keras.',
  'Tetap pertahankan lipatan yang lembut dan terkontrol.',
  'Jangan membuat terlihat seperti 3D atau plastik.',
]
