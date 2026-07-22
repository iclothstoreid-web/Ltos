// Render Recipe — permanent, per-ITEM structured data describing HOW an AI
// Render Engine should render a Master Item (camera/pose/lighting/etc). It
// sits between AI Design DNA and the future Prompt Builder in the locked
// architecture:
//
//   Customer Digital Profile + Design Specification -> AI Design DNA
//     -> Render Recipe -> Prompt Builder -> OpenAI API -> AI Render
//
// Render Recipe is NEVER a prompt and NEVER stores sentences/free text for
// AI consumption — only structured data. Prompt is temporary and may
// change; Recipe is permanent and does not. This sprint builds structure
// only: no AI, no OpenAI, no Prompt, no image processing.
export type RenderRecipeStatus = 'empty' | 'configured'

export interface RenderRecipe {
  status: RenderRecipeStatus
  version: number
  camera: Record<string, unknown>
  pose: Record<string, unknown>
  lighting: Record<string, unknown>
  composition: Record<string, unknown>
  focus: Record<string, unknown>
  fabricBehavior: Record<string, unknown>
  visibilityRules: Record<string, unknown>
  // Producers for what Component DNA (still unbuilt) will eventually
  // describe about the item itself, as opposed to how it's shot/lit above.
  // Sprint AI-07 only opens these as structured containers — no Component
  // DNA exists yet to populate them, so every item's recipe carries them
  // empty until that sprint lands. `fabricIdentity` (what the fabric IS —
  // weave, color, material identity) is deliberately separate from the
  // existing `fabricBehavior` (how it drapes/moves in a render).
  garment: Record<string, unknown>
  fabricIdentity: Record<string, unknown>
  stitching: Record<string, unknown>
  embroidery: Record<string, unknown>
  renderPriority: string[]
  negativeRules: string[]
}

// Matches the DB column default on design_master_options.render_recipe
// exactly — every INSERT (through this app or any future one) gets this
// shape for free at the database level, same guarantee as AI Design DNA
// (see migration add_render_recipe_to_master_options).
export const DEFAULT_RENDER_RECIPE: RenderRecipe = {
  status: 'empty',
  version: 1,
  camera: {},
  pose: {},
  lighting: {},
  composition: {},
  focus: {},
  fabricBehavior: {},
  visibilityRules: {},
  garment: {},
  fabricIdentity: {},
  stitching: {},
  embroidery: {},
  renderPriority: [],
  negativeRules: [],
}

export const RENDER_RECIPE_STATUS_LABELS: Record<RenderRecipeStatus, string> = {
  empty: 'Empty',
  configured: 'Configured',
}
