// Scene Configuration — Engine Section 4/7 (Prompt Architecture Realignment,
// 2026-08-06; content originally Global Render Recipe, Render Engine
// Knowledge Refactor 2026-08-04, Camera/Visibility split same day). Renamed
// file/exports only — wording unchanged, storage-location move.
//
// Responsibility is strictly GLOBAL SCENE — camera/lighting/composition/
// background/visibility — never a quality target (Global Quality Rules),
// never a constraint (Garment Layout / Final Constraints: this layer states
// the scene positively, it never says "do not"), never identity (Identity
// Preservation), never material/component knowledge.
//
// Repository Knowledge Migration Phase 1 (2026-08-06) — VERBATIM placement
// of the Prompt UAT block, byte-exact. `shadow` dropped: not present in the
// UAT content, and background is now the customer's own (see
// SCENE_CONFIGURATION_BACKGROUND below and Identity Preservation's matching
// "tampilkan background foto customer" instruction), so a studio "natural
// ground shadow" default no longer applies.
//
// Key naming — the UAT text spells out each field as "<label>: <value>"
// inline (e.g. "pengaturan: Pencahayaan studio lembut."). promptBuilder/
// serializer.ts's formatRecord() already renders every Record<string,
// unknown> field as `${key}: ${value}` — so to reproduce the UAT text
// verbatim (not paraphrase it, not leave a stale English key sitting next
// to a translated value) the object keys themselves are renamed to match
// the UAT's own labels: `setup`->`pengaturan`, `layout`->`tata letak`,
// `setting`->`pengaturan` (same label the UAT reuses for both Lighting and
// Background — not a collision, different objects), `framing`->
// `pembingkaian`. `view` is unchanged: the UAT's first clause ("Tampilan
// depan.") carries no label of its own, so no replacement key was given for
// it. This interpretation is flagged in this sprint's report, not asserted
// as the only possible reading.
export const SCENE_CONFIGURATION_CAMERA: Record<string, unknown> = {
  view: 'Tampilan depan.',
}

// Visibility — body-visibility/framing extent only (what portion of the
// body/garment is shown, never the viewing angle — that is Camera's job
// above).
export const SCENE_CONFIGURATION_VISIBILITY: Record<string, unknown> = {
  pembingkaian: 'Seluruh tubuh. Dari kepala hingga kaki. Kaki terlihat. Tanpa pemotongan gambar (no crop).',
}

export const SCENE_CONFIGURATION_LIGHTING: Record<string, unknown> = {
  pengaturan: 'Pencahayaan studio lembut.',
}

export const SCENE_CONFIGURATION_COMPOSITION: Record<string, unknown> = {
  'tata letak': 'Komposisi terpusat.',
}

// `background` is a free-form Record<string, unknown> Recipe Composer
// merges unconditionally into every render. No trailing period on the value
// below — verbatim, the UAT text has none (the comma leading into the next
// clause replaces it).
export const SCENE_CONFIGURATION_BACKGROUND: Record<string, unknown> = {
  pengaturan: 'Latar belakang alami yg di bawa customer',
}
