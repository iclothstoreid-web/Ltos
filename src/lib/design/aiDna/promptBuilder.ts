import type { AiDesignDna } from './types'
import type { MasterDataCategory } from '@/lib/design/masterData'

// Interface only — per this sprint's brief, Prompt is explicitly temporary
// (never persisted, unlike AI DNA) and out of scope. No OpenAI call, no
// Vision, no prompt text generated yet. A later "AI Vision Integration"
// sprint fills these bodies in without needing to change this shape.

export interface PromptBuilderInput {
  itemId: string
  category: MasterDataCategory
  itemName: string
  dna: AiDesignDna
}

// Will eventually turn a Master Item's AI DNA into the temporary prompt
// text sent to an image/vision model. Returns null until that sprint.
export function buildPromptFromDNA(_input: PromptBuilderInput): string | null {
  return null
}

export interface RenderInstructionInput {
  itemId: string
  category: MasterDataCategory
  dna: AiDesignDna
}

// Will eventually turn AI DNA into the structured instruction payload
// Render Context hands to the AI Render Engine. Returns null until that
// sprint.
export function buildRenderInstruction(_input: RenderInstructionInput): Record<string, unknown> | null {
  return null
}
