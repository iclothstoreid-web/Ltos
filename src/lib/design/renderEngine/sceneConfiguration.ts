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
// Final Repository Knowledge Migration (2026-08-06) — FULL REPLACE per
// latest Prompt UAT (Indonesian). `shadow` dropped: not present in the UAT
// content, and background is now the customer's own (see
// SCENE_CONFIGURATION_BACKGROUND below and Identity Preservation's matching
// "tampilkan background foto customer" instruction), so a studio "natural
// ground shadow" default no longer applies.
export const SCENE_CONFIGURATION_CAMERA: Record<string, unknown> = {
  view: 'Tampilan depan.',
}

// Visibility — body-visibility/framing extent only (what portion of the
// body/garment is shown, never the viewing angle — that is Camera's job
// above).
export const SCENE_CONFIGURATION_VISIBILITY: Record<string, unknown> = {
  framing: 'Seluruh tubuh. Dari kepala hingga kaki. Kaki terlihat. Tanpa pemotongan gambar (no crop).',
}

export const SCENE_CONFIGURATION_LIGHTING: Record<string, unknown> = {
  setup: 'Pencahayaan studio lembut.',
}

export const SCENE_CONFIGURATION_COMPOSITION: Record<string, unknown> = {
  layout: 'Komposisi terpusat.',
}

// `background` is a free-form Record<string, unknown> Recipe Composer
// merges unconditionally into every render.
export const SCENE_CONFIGURATION_BACKGROUND: Record<string, unknown> = {
  setting: 'Latar belakang alami yang dibawa customer.',
}
