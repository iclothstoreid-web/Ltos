// Global Render Recipe (Render Engine Knowledge Refactor, 2026-08-04;
// revised same day per review) — ONE of 4 sibling Render Engine concerns
// (see qualityFoundation.ts's header for the full sibling list).
// Responsibility is strictly GLOBAL SCENE — camera/lighting/composition/
// background/shadow/visibility — never a quality target (Quality
// Foundation), never a constraint (Global Render Policy: this layer states
// the scene positively, it never says "do not"), never identity (Identity
// Lock, promptArchitectureV2/layers.ts, untouched by this refactor), never
// material/component knowledge. 6 fields now, not 5 — Camera and Visibility
// were one field before this revision (see below).
//
// Camera vs. Visibility split (review revision) — the first pass of this
// refactor folded "full body head-to-toe, feet visible, no crop" into
// Camera alongside "Front-facing view.", reasoning that dropping it would
// regress a real production bug fix (Sprint AI-R2's half-body-crop fix).
// Review corrected the RESPONSIBILITY split instead of accepting that
// mixing: Camera owns viewing angle ONLY; body-visibility/framing EXTENT is
// a separate concern (Visibility, below) that happens to map onto a field
// (`visibilityRules`) MasterRenderRecipe already has — it was simply never
// fed by GlobalRenderPolicy before (per-item RenderRecipe.visibilityRules
// was the only source). No content lost, no bug regressed: the exact same
// "full body/no crop" text still reaches GPT Image — sourced from its own
// correctly-scoped field instead of being appended to Camera's. Engine
// Priority Refactor (2026-08-04, same day) — subsequently promoted this
// field, along with the rest of Global Render Recipe, from Priority 2
// (Visual Description) to Priority 0 (compression.ts's
// buildGlobalRenderRecipeContent), so it is now never truncated at all,
// not merely "reaches the same layer as before."
export const GLOBAL_RENDER_RECIPE_CAMERA: Record<string, unknown> = {
  view: 'Front-facing view.',
}

// Visibility — body-visibility/framing extent only (what portion of the
// body/garment is shown, never the viewing angle — that is Camera's job
// above). Maps onto MasterRenderRecipe.visibilityRules, wired in via
// recipeComposer/types.ts's DEFAULT_GLOBAL_RENDER_POLICY.visibilityRules
// (new field, this revision) and merged the same "policy baseline, item
// overrides" way Camera/Lighting already are (composer.ts).
export const GLOBAL_RENDER_RECIPE_VISIBILITY: Record<string, unknown> = {
  framing: 'Full body. Head-to-toe. Feet visible. No crop.',
}

export const GLOBAL_RENDER_RECIPE_LIGHTING: Record<string, unknown> = {
  setup: 'Soft studio lighting.',
}

// Wired into DEFAULT_GLOBAL_RENDER_POLICY.composition (recipeComposer/
// types.ts, new field this revision) and merged into MasterRenderRecipe.
// composition the same "policy baseline, item overrides" way Camera/
// Lighting already are (composer.ts) — the GlobalRenderPolicy interface and
// composer.ts's policy-overlap field list were extended (Camera/Pose/
// Lighting -> +Composition/+Visibility) per review's explicit "Wire
// Composition ke Recipe Composer" instruction. Previously flagged as
// content with no delivery path without touching composer.ts's merge; this
// revision makes that touch deliberately, per instruction, nothing else in
// composer.ts's merge algorithm changed.
export const GLOBAL_RENDER_RECIPE_COMPOSITION: Record<string, unknown> = {
  layout: 'Centered composition.',
}

// `shadow` has no dedicated field anywhere in the RenderRecipe/
// MasterRenderRecipe/RenderInstruction type chain, and adding one would mean
// touching that whole chain (recipeComposer/types.ts, promptBuilder/
// builder.ts, promptBuilder/compression.ts, promptBuilder/serializer.ts) for
// a single extra string — a schema change, not a content move, and outside
// this refactor's "no redesign" scope. `background` is already a free-form
// Record<string, unknown> Recipe Composer merges unconditionally into every
// render, so shadow is carried as one more key on it instead.
export const GLOBAL_RENDER_RECIPE_BACKGROUND: Record<string, unknown> = {
  setting: 'Clean neutral studio background.',
  shadow: 'Natural ground shadow.',
}
