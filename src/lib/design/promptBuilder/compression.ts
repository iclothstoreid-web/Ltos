import type { RenderInstruction } from './types'

// Prompt Compression — an ADDITIVE layer next to the existing Prompt
// Serializer (serializer.ts), not a replacement for it. serializeOpenAI()
// stays the full, uncompressed provider prompt; this module produces a
// second, token-budgeted string for callers that need to stay inside a hard
// total budget (Image Service does not consume this yet — see
// resolveDNA/route.ts's own notes on why).
//
// Word/token conversion is a rough approximation only (no real tokenizer
// dependency here): 1 word ~= 1.3 tokens.
const WORDS_PER_TOKEN = 1 / 1.3

export interface PromptSection {
  label: string
  content: string
  maxTokens: number
}

export interface CompressionResult {
  compressed: string
  totalTokens: number
  metadata: {
    sectionsIncluded: string[]
    sectionsOmitted: string[]
    estimatedTokens: Record<string, number>
  }
}

function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean)
  return Math.ceil(words.length * (1 / WORDS_PER_TOKEN))
}

function truncateToTokenBudget(content: string, maxTokens: number): string {
  const words = content.trim().split(/\s+/).filter(Boolean)
  const maxWords = Math.floor(maxTokens * WORDS_PER_TOKEN)

  if (words.length <= maxWords) return content.trim()

  return `${words.slice(0, maxWords).join(' ')}...`
}

// Fits `sections` into `totalBudget` tokens (~270 per the locked Prompt
// Compression Strategy), in order: each section is truncated to its own
// `maxTokens` first, then only added if it still fits inside what's left of
// the total budget — a section that would blow the remaining budget is
// omitted entirely rather than partially included, so `compressed` never
// exceeds `totalBudget`.
export function compressPrompt(sections: PromptSection[], totalBudget = 270): CompressionResult {
  const parts: string[] = []
  const metadata = {
    sectionsIncluded: [] as string[],
    sectionsOmitted: [] as string[],
    estimatedTokens: {} as Record<string, number>,
  }
  let totalTokens = 0

  for (const section of sections) {
    if (!section.content.trim()) {
      metadata.sectionsOmitted.push(section.label)
      continue
    }

    const truncated = truncateToTokenBudget(section.content, section.maxTokens)
    const tokens = estimateTokens(truncated)

    if (totalTokens + tokens > totalBudget) {
      metadata.sectionsOmitted.push(section.label)
      continue
    }

    parts.push(`${section.label}: ${truncated}`)
    totalTokens += tokens
    metadata.sectionsIncluded.push(section.label)
    metadata.estimatedTokens[section.label] = tokens
  }

  return { compressed: parts.join('. '), totalTokens, metadata }
}

function stringifyRecord(record: Record<string, unknown>): string {
  return Object.entries(record)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key} ${Array.isArray(value) ? value.join('/') : String(value)}`)
    .join(', ')
}

// Maps a compiled RenderInstruction onto the 4 buckets of the Prompt
// Compression Strategy (Anchor/Material/Other/Negatives, ~270 tokens total).
//
// Known gap: RenderInstruction has no dedicated Color field — nothing
// between AI Design DNA and Prompt Builder carries a "color" concept of its
// own (warna_bahan content ends up wherever that item's own Render Recipe
// happened to put it). The strategy's 10-token Color budget is folded into
// Other rather than inventing a Color source that doesn't exist.
export function buildCompressedSections(instruction: RenderInstruction): PromptSection[] {
  return [
    {
      label: 'Anchor',
      content: [instruction.garment, instruction.subject, instruction.body].map(stringifyRecord).filter(Boolean).join('; '),
      maxTokens: 150,
    },
    {
      label: 'Material',
      content: stringifyRecord(instruction.fabric),
      maxTokens: 15,
    },
    {
      label: 'Other',
      content: [
        instruction.camera,
        instruction.lighting,
        instruction.composition,
        instruction.background,
        instruction.quality,
        instruction.stitching,
        instruction.embroidery,
      ]
        .map(stringifyRecord)
        .filter(Boolean)
        .join('; '),
      maxTokens: 55,
    },
    {
      label: 'Negatives',
      content: instruction.negativeRules.join(', '),
      maxTokens: 50,
    },
  ]
}
