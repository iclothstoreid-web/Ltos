import type { RenderInstruction } from './types'

// Prompt Serializer — the ONLY layer allowed to translate a RenderInstruction
// into Prompt text for a specific AI provider. Prompt Builder must never
// generate Prompt text itself; it only produces the neutral RenderInstruction
// this module reads (see builder.ts). Interface only this sprint — no
// OpenAI/Gemini/Claude call, no Prompt text, no streaming/retry/queue.

export interface PromptSerializerInput {
  instruction: RenderInstruction
}

// Will eventually turn a RenderInstruction into an OpenAI-flavored Prompt
// string. No implementation this sprint.
export function serializeOpenAI(_input: PromptSerializerInput): string | null {
  return null
}

// Will eventually turn a RenderInstruction into a Gemini-flavored Prompt
// string. No implementation this sprint.
export function serializeGemini(_input: PromptSerializerInput): string | null {
  return null
}

// Will eventually turn a RenderInstruction into a Claude-flavored Prompt
// string. No implementation this sprint.
export function serializeClaude(_input: PromptSerializerInput): string | null {
  return null
}
