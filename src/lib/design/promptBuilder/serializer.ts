import type { RenderInstruction } from './types'

// Prompt Serializer — the ONLY layer allowed to translate a RenderInstruction
// into Prompt text for a specific AI provider. Prompt Builder must never
// generate Prompt text itself; it only produces the neutral RenderInstruction
// this module reads (see builder.ts).
//
// serializeOpenAI() targets GPT Image (the model src/lib/ai/services/image.ts
// calls via images.generate). GPT Image has no dedicated negative-prompt
// parameter, so negativeRules are folded into the text itself as an explicit
// "Avoid" clause — that's what makes this serialization provider-specific
// rather than a generic object-to-string formatter. This file must never
// import or call the OpenAI SDK; it only produces a string.

export interface PromptSerializerInput {
  instruction: RenderInstruction
}

type RenderInstructionSectionKey = Exclude<keyof RenderInstruction, 'negativeRules'>

interface PromptSection {
  key: RenderInstructionSectionKey
  label: string
}

// Fixed, deterministic order — subject and body first, then what's worn,
// then how it's shot, matching how a human art director would brief a
// photographer. Order never depends on object key insertion order.
const SECTION_ORDER: PromptSection[] = [
  { key: 'subject', label: 'Subject' },
  { key: 'body', label: 'Body' },
  { key: 'garment', label: 'Garment' },
  { key: 'fabric', label: 'Fabric' },
  { key: 'stitching', label: 'Stitching' },
  { key: 'embroidery', label: 'Embroidery' },
  { key: 'camera', label: 'Camera' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'composition', label: 'Composition' },
  { key: 'background', label: 'Background' },
  { key: 'quality', label: 'Quality' },
]

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).filter(Boolean).join(', ')
  }

  if (typeof value === 'object') {
    return formatRecord(value as Record<string, unknown>)
  }

  return String(value)
}

// Keys are sorted so the same RenderInstruction content always serializes to
// the same string, regardless of the order its fields were assigned in.
function formatRecord(record: Record<string, unknown>): string {
  return Object.keys(record)
    .sort()
    .map((key) => {
      const value = formatValue(record[key])
      return value ? `${key}: ${value}` : ''
    })
    .filter(Boolean)
    .join(', ')
}

function formatSection(label: string, record: Record<string, unknown> | undefined): string {
  if (!record) {
    return ''
  }

  const body = formatRecord(record)
  return body ? `${label} — ${body}` : ''
}

// Turns a RenderInstruction into a single deterministic prompt string for
// OpenAI's GPT Image model. Returns null when there is nothing to describe
// (e.g. Prompt Builder has not produced a populated RenderInstruction yet),
// so callers (Image Service) can distinguish "no prompt yet" from a real
// provider failure.
export function serializeOpenAI(input: PromptSerializerInput): string | null {
  const { instruction } = input

  if (!instruction) {
    return null
  }

  const sections = SECTION_ORDER.map(({ key, label }) => formatSection(label, instruction[key])).filter(Boolean)

  if (sections.length === 0) {
    return null
  }

  let prompt = `${sections.join('. ')}.`

  const negativeRules = (instruction.negativeRules ?? []).filter(Boolean)
  if (negativeRules.length > 0) {
    prompt += ` Avoid: ${negativeRules.join(', ')}.`
  }

  return prompt
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
