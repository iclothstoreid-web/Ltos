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
// Repository Knowledge Migration Phase 1 (2026-08-06) — VERBATIM placement
// of the Prompt UAT block, byte-exact, replacing the prior "Final Repository
// Knowledge Migration" pass's cleaned-up 11-item array (which had rewritten
// wording/punctuation and lost several UAT-only clauses). Kept as ONE array
// item (not split by clause) so recipeComposer/types.ts's
// `GLOBAL_QUALITY_RULES.join(' ')` cannot alter the UAT's own comma
// placement (the UAT uses commas as separators here, not this file's
// join(' ') convention). Note: "Jangan membuat kerutan atau lipatan yang
// tidak alami" and "Jangan membuat kerutan yang tidak alami atau
// berlebihan" are near-duplicates in the source — per instruction, flagged
// in this sprint's report and left exactly as given, not merged/removed.
export const GLOBAL_QUALITY_RULES: string[] = [
  'Jangan merusak struktur pakaian,Jangan membuat bayangan kasar yang mengaburkan detail kain,Jangan membuat silau atau highlight yang berlebihan, Jangan membuat kain menjadi satu warna datar harus menunjukkan dimensi tekstur, Jangan menimpa pencahayaan dengan pantulan yang tidak realistis, Jangan membuat kerutan atau lipatan yang tidak alami, Jangan mengubah pola kain atau struktur tenun, Jangan membuat kain menjadi datar atau tidak bernyawa, Jangan membuat kain menjadi mengkilap atau terlalu mengkilat - menjaga estetika matte dan terlihat alami seperti pakaian, Jangan membuat kerutan yang tidak alami atau berlebihan, Jangan membuat tampilan kaku atau keras - tetap pertahankan lipatan yang lembut dan terkontrol,jangan membuat Terlihat seperti 3D atau plastik.',
]
