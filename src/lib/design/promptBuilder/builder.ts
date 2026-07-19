import type { PromptBuilderInput, RenderInstruction, RenderInstructionValidation } from './types'

// Interface only — per this sprint's brief (AI Prompt Builder Foundation),
// no assembly logic, no AI, no OpenAI call. A later sprint (AI API
// Integration) fills this body in without needing to change the
// RenderInstruction shape (see types.ts).

// Will eventually read Customer Digital Profile + Design Specification +
// Master Render Recipe + AI Design DNA and produce one RenderInstruction.
// No implementation this sprint.
export function buildRenderInstruction(_input: PromptBuilderInput): RenderInstruction | null {
  return null
}

// Will eventually check a RenderInstruction is structurally sound (e.g.
// required fields present) before Prompt Serializer reads it. No rules
// implemented this sprint.
export function validateRenderInstruction(_instruction: RenderInstruction | null): RenderInstructionValidation {
  return { valid: true, errors: [] }
}
