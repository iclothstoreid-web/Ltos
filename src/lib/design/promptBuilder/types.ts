// Prompt Builder (Sprint AI-06 — locked architecture) — a COMPILER, not a
// business layer. It reads ONLY MasterRenderRecipe; every merge/conflict/
// business decision already happened in Recipe Composer (see
// recipeComposer/composer.ts). Sits between Recipe Composer and Prompt
// Serializer in the locked architecture:
//
//   Customer Digital Profile -> Component DNA -> Recipe Composer
//     -> Master Render Recipe -> Prompt Builder -> RenderInstruction
//     -> Prompt Serializer -> Image Service -> AI Provider
//
// Prompt Builder never reads Customer Digital Profile, Design
// Specification, Component/AI Design DNA, Render Recipe, or the database
// directly — those are Recipe Composer's inputs, not this module's. An
// earlier draft of this file declared a PromptBuilderInput that read all
// of those directly; it was removed when this sprint locked Prompt
// Builder's input down to MasterRenderRecipe only (see builder.ts).
//
// RenderInstruction is NOT a prompt — it never stores sentences/free text,
// only structured data, same non-prompt rule as Render Recipe and Master
// Render Recipe.

// Render Instruction — the neutral, AI-agnostic representation Prompt
// Builder produces. Never persisted (same rule as RenderContext and Master
// Render Recipe — assembled on demand only) and never a Prompt itself; the
// (future) Prompt Serializer is the only layer allowed to turn this into
// Prompt text for a specific AI provider.
export interface RenderInstruction {
  subject: Record<string, unknown>
  body: Record<string, unknown>
  garment: Record<string, unknown>
  camera: Record<string, unknown>
  lighting: Record<string, unknown>
  composition: Record<string, unknown>
  background: Record<string, unknown>
  fabric: Record<string, unknown>
  stitching: Record<string, unknown>
  embroidery: Record<string, unknown>
  quality: Record<string, unknown>
  negativeRules: string[]
}

export interface RenderInstructionValidation {
  valid: boolean
  errors: string[]
}
