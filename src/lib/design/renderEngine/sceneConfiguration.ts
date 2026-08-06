// Scene Configuration — Engine Section 4/7 (Prompt Architecture Realignment,
// 2026-08-06; content originally Global Render Recipe, Render Engine
// Knowledge Refactor 2026-08-04, Camera/Visibility split same day). Renamed
// file/exports only — wording unchanged, storage-location move.
//
// Responsibility is strictly GLOBAL SCENE — camera/lighting/composition/
// background/shadow/visibility — never a quality target (Global Quality
// Rules), never a constraint (Garment Layout / Final Constraints: this layer
// states the scene positively, it never says "do not"), never identity
// (Identity Preservation), never material/component knowledge.
export const SCENE_CONFIGURATION_CAMERA: Record<string, unknown> = {
  view: 'Front-facing view.',
}

// Visibility — body-visibility/framing extent only (what portion of the
// body/garment is shown, never the viewing angle — that is Camera's job
// above).
export const SCENE_CONFIGURATION_VISIBILITY: Record<string, unknown> = {
  framing: 'Full body. Head-to-toe. Feet visible. No crop.',
}

export const SCENE_CONFIGURATION_LIGHTING: Record<string, unknown> = {
  setup: 'Soft studio lighting.',
}

export const SCENE_CONFIGURATION_COMPOSITION: Record<string, unknown> = {
  layout: 'Centered composition.',
}

// `shadow` has no dedicated field anywhere in the RenderRecipe/
// MasterRenderRecipe/RenderInstruction type chain, and adding one would be a
// schema change, not a content move. `background` is already a free-form
// Record<string, unknown> Recipe Composer merges unconditionally into every
// render, so shadow is carried as one more key on it instead.
export const SCENE_CONFIGURATION_BACKGROUND: Record<string, unknown> = {
  setting: 'Clean neutral studio background.',
  shadow: 'Natural ground shadow.',
}
