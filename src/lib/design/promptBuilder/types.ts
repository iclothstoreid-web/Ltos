import type { CustomerDigitalProfile } from '@/lib/customerProfile/types'
import type { DesignSpecification } from '@/lib/designSpecification/types'
import type { MasterRenderRecipe } from '@/lib/design/recipeComposer/types'
import type { AiDesignDna } from '@/lib/design/aiDna/types'

// Prompt Builder — turns every LTOS object (Customer Digital Profile,
// Design Specification, AI Design DNA, Master Render Recipe) into a single
// AI-agnostic RenderInstruction. Sits between Recipe Composer and the
// future Prompt Serializer in the locked architecture:
//
//   Customer Digital Profile + Design Specification -> AI Design DNA
//     -> Render Recipe -> Recipe Composer -> Master Render Recipe
//     -> Prompt Builder -> RenderInstruction -> Prompt Serializer -> Prompt String
//
// RenderInstruction is NOT a prompt — it never stores sentences/free text,
// only structured data, same non-prompt rule as Render Recipe and Master
// Render Recipe. This sprint (Foundation) builds structure/interfaces only:
// no OpenAI call, no Vision, no Image Generation, no Prompt text.

// One Master Item's AI Design DNA plus which item it belongs to — Prompt
// Builder reads DNA per contributing Master Item, not a single DNA object,
// since DNA is permanent and per-ITEM (see aiDna/types.ts).
export interface PromptBuilderDnaEntry {
  itemId: string
  dna: AiDesignDna
}

export interface PromptBuilderInput {
  customerDigitalProfile: CustomerDigitalProfile
  designSpecification: DesignSpecification | null
  masterRenderRecipe: MasterRenderRecipe | null
  aiDesignDna: PromptBuilderDnaEntry[]
}

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
