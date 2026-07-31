import type { RenderInstruction } from './types'
import { formatRecord } from './serializer'
import type { RenderRecipeEntry, MasterRenderRecipe } from '@/lib/design/recipeComposer/types'
import { masterDataCategoryLabel, type MasterDataCategory } from '@/lib/design/masterData'

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

// Recursive — a nested object value (e.g. an AI Design DNA field authored as
// a structured object rather than a string) must flatten through
// stringifyRecord again, not fall through to String(value), which is what
// used to produce literal "[object Object]" in the compressed prompt sent to
// OpenAI. Mirrors formatValue/formatRecord's recursion in serializer.ts, kept
// in this file's own "key value" (no colon) formatting style.
function stringifyValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  if (Array.isArray(value)) return value.map(stringifyValue).filter(Boolean).join('/')
  if (typeof value === 'object') return stringifyRecord(value as Record<string, unknown>)
  return String(value)
}

function stringifyRecord(record: Record<string, unknown>): string {
  return Object.entries(record)
    .map(([key, value]) => {
      const formatted = stringifyValue(value)
      return formatted ? `${key} ${formatted}` : ''
    })
    .filter(Boolean)
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

// ===========================================================================
// Layer-Based Compression (Sprint PR-04) — replaces the fixed Anchor/Material/
// Other/Negatives buckets above for the production call site. The old scheme
// truncated each bucket to its OWN word count, then dropped the whole bucket
// if it still didn't fit the remaining total budget — but a bucket's
// CONTENTS were never priority-ordered internally. Once Model Thobe's own
// AI Design DNA became rich (Sprint after PR-03), its content alone filled
// the ~150-token "Anchor" bucket, and Material Color's `garment.color` key
// (added last during Recipe Composer's merge — see recipeComposer/
// composer.ts's mergeRecordField) fell after the truncation cutoff and was
// silently dropped. Not a DNA bug, not a Resolver bug, not a Recipe Composer
// bug (none of those are touched here) — a Prompt Compression bug: it never
// knew "Model Thobe" and "Material Color" were different, differently-
// critical things sharing one bucket.
//
// Built from `entries: RenderRecipeEntry[]` (DNA Resolver's per-item output,
// BEFORE Recipe Composer merges everything into one flat MasterRenderRecipe)
// specifically so each Layer's content comes from exactly one category's own
// resolved data — no cross-item collision is possible here even though
// Recipe Composer's own Anchor-collision rule (unchanged, still used for
// buildRenderInstruction/serializeOpenAI's uncompressed output and
// validateRenderInstruction) still applies to MasterRenderRecipe itself.

export type PromptLayerPriority = 0 | 1 | 2

// Priority 0 — Identity Lock, Model Thobe, Look Cutting, Material, Material
// Color. Never truncated, never dropped by compressPromptByLayers; if they
// cannot all fit, the whole render is refused (see compressPromptByLayers).
// Priority 1 — Selected Components (Collar/Cuff/Pocket/Placket/Embroidery/
// Accessory) that the customer actually picked (skipped automatically for
// "(None)" — that component simply never produces a layer, see
// buildPromptLayers). Compressed/dropped only after Priority 2 is exhausted.
// Priority 2 — Visual Description (camera/lighting/composition/background/
// quality/pose/visibility/negativeRules): narrative/mood only, nothing here
// is a component identity. Compressed first.
export interface PromptLayer {
  id: string
  label: string
  priority: PromptLayerPriority
  content: string
}

export interface LayerTokenReport {
  id: string
  label: string
  priority: PromptLayerPriority
  tokens: number
  included: boolean
  truncated: boolean
}

export interface LayeredCompressionResult {
  ok: boolean
  compressed: string
  // Non-null only when ok === false — Phase 4: "STOP. JANGAN menghapus
  // Priority 0. Laporkan error." This is the one situation where
  // compressPromptByLayers refuses to produce a prompt at all, rather than
  // silently deleting Identity/Model Thobe/Look Cutting/Material/Material
  // Color content to make room.
  error: string | null
  totalTokens: number
  layerReport: LayerTokenReport[]
}

const SELECTED_COMPONENT_CATEGORIES: MasterDataCategory[] = [
  'kerah',
  'manset',
  'plaket',
  'saku',
  'bordir',
  'handmade_zigzag',
  'aksesori',
]

// One entry's own resolved content only — garment (DNA Resolver's per-item
// output) plus its own fabricIdentity/fabricBehavior (per-item sensory
// fields Recipe Composer would otherwise merge across items). Never reads
// another entry's data, so two entries in the same category collision the
// old Anchor-rule solves for MasterRenderRecipe never arises here at all.
function formatEntryContent(entry: RenderRecipeEntry): string {
  return [
    formatRecord(entry.recipe.garment),
    formatRecord(entry.recipe.fabricIdentity),
    formatRecord(entry.recipe.fabricBehavior),
  ]
    .filter(Boolean)
    .join(', ')
}

function buildVisualDescriptionContent(masterRecipe: MasterRenderRecipe | null): string {
  if (!masterRecipe) return ''
  const parts = [
    formatRecord(masterRecipe.pose),
    formatRecord(masterRecipe.visibilityRules),
    formatRecord(masterRecipe.camera),
    formatRecord(masterRecipe.lighting),
    formatRecord(masterRecipe.composition),
    formatRecord(masterRecipe.background),
    formatRecord(masterRecipe.quality),
  ].filter(Boolean)

  let content = parts.join(', ')
  const negatives = (masterRecipe.negativeRules ?? []).filter(Boolean)
  if (negatives.length > 0) {
    content += `${content ? '. ' : ''}Avoid: ${negatives.join(', ')}.`
  }
  return content
}

export interface BuildPromptLayersInput {
  entries: RenderRecipeEntry[]
  // Only read for the Priority 2 Visual Description layer (camera/lighting/
  // composition/background/quality/pose/visibilityRules/negativeRules) —
  // Recipe Composer's own merge is unchanged and still the source for those
  // fields; Priority 0/1 layers below never read from it.
  masterRecipe: MasterRenderRecipe | null
  identityTemplate: string
}

// Phase 1 (Sprint PR-04) — splits the render into the 7 layers the brief
// specifies. A category with no resolved entry (never selected, or
// selected as the design-level "(None)" sentinel — which never reaches
// `entries` at all, see design-studio/types.ts's OPTIONAL_FIELDS) simply
// produces an empty-content layer for Priority 0 slots (Look Cutting) or is
// skipped entirely for Priority 1 slots (Selected Components) — "Skip
// otomatis jika NONE" per the brief.
export function buildPromptLayers(input: BuildPromptLayersInput): PromptLayer[] {
  const { entries, masterRecipe, identityTemplate } = input

  const byCategory = new Map<MasterDataCategory, RenderRecipeEntry>()
  entries.forEach((entry) => {
    if (!byCategory.has(entry.category)) byCategory.set(entry.category, entry)
  })

  const layers: PromptLayer[] = []

  layers.push({ id: 'identity', label: 'Identity Lock', priority: 0, content: identityTemplate })

  const modelThobeEntry = byCategory.get('model_thobe')
  layers.push({ id: 'model_thobe', label: 'Model Thobe', priority: 0, content: modelThobeEntry ? formatEntryContent(modelThobeEntry) : '' })

  const lookCuttingEntry = byCategory.get('look_cutting')
  layers.push({ id: 'look_cutting', label: 'Look Cutting', priority: 0, content: lookCuttingEntry ? formatEntryContent(lookCuttingEntry) : '' })

  const bahanEntry = byCategory.get('bahan')
  layers.push({ id: 'material', label: 'Material', priority: 0, content: bahanEntry ? formatEntryContent(bahanEntry) : '' })

  const warnaEntry = byCategory.get('warna_bahan')
  layers.push({ id: 'material_color', label: 'Material Color', priority: 0, content: warnaEntry ? formatEntryContent(warnaEntry) : '' })

  SELECTED_COMPONENT_CATEGORIES.forEach((category) => {
    const entry = byCategory.get(category)
    if (!entry) return
    layers.push({ id: `component:${category}`, label: masterDataCategoryLabel(category), priority: 1, content: formatEntryContent(entry) })
  })

  layers.push({ id: 'visual_description', label: 'Visual Description', priority: 2, content: buildVisualDescriptionContent(masterRecipe) })

  return layers
}

function layerTokens(layer: PromptLayer): number {
  return estimateTokens(layer.content)
}

// Default budget (Sprint PR-04) — raised from the old fixed 270 tokens.
// That number predates Model Thobe ever having a complete AI Design DNA;
// measured against Saudi Modern's now fully-authored DNA (regression test,
// Phase 6), Priority 0 alone (Identity + Model Thobe + Look Cutting +
// Material + Material Color) already needs ~620-660 tokens — meaning the
// old budget could no longer fit Priority 0 alone, let alone any Priority
// 1/2 content, and Phase 4 would refuse every real render. 1200 leaves
// realistic headroom above that measured P0 floor for at least one
// Priority 1 Selected Component plus some Priority 2 Visual Description,
// while still being a real, finite ceiling — a render selecting many
// components (Collar+Cuff+Pocket+Placket+Embroidery+Accessory) can still
// exceed it, at which point Priority 2 then Priority 1 compress as
// designed. GPT Image (gpt-image-1) has no prompt-length constraint anywhere
// near this range; this budget exists for the pipeline's own token-cost
// tracking, not an OpenAI limit.
const DEFAULT_LAYER_TOTAL_BUDGET = 1200

interface PackResult {
  contents: string[]
  usedTokens: number
}

// Best-Fit packing (Sprint PR-06) — replaces the old single-pass greedy scan
// that BROKE the instant one candidate didn't fit whole, silently discarding
// every candidate still left in the queue no matter how small. That's what
// let Plaket Hexagonal's 697-token DNA zero out the budget via Manset's
// truncation and take Saku's 52-token pocket layer down with it, even though
// 52 tokens of room genuinely existed — confirmed in production PAT-01/02
// (2026-07-31): `component:plaket` and `component:saku` both came back
// `included: false`, and the render showed no hexagon and no pocket at all.
//
// Two passes, no break:
//   Pass 1 (maximize count) — candidates sorted smallest-token-first; each
//   one that fits whole is taken whole. A candidate that doesn't fit is
//   deferred, not fatal — the scan keeps going, so a later (or smaller)
//   candidate still gets its shot at whatever budget remains.
//   Pass 2 (fair-share truncation) — whatever budget pass 1 left over is
//   split evenly across every deferred candidate (remainder to the last/
//   largest one), so one oversized layer can no longer starve the rest of
//   all remaining room. Every selected component ends up with SOME
//   representation in the final prompt rather than a lucky few getting
//   everything and the rest getting nothing.
// Output order follows the original `candidates` order (category priority),
// not the size-sorted scan order — sorting only drives the fit decision.
function packLayers(candidates: PromptLayer[], budget: number, markIncluded: (id: string, truncated?: boolean) => void): PackResult {
  let remaining = budget
  const included = new Map<string, string>()
  const deferred: PromptLayer[] = []

  const bySize = [...candidates].sort((a, b) => layerTokens(a) - layerTokens(b))
  for (const layer of bySize) {
    const tokens = layerTokens(layer)
    if (remaining > 0 && tokens <= remaining) {
      included.set(layer.id, layer.content)
      markIncluded(layer.id)
      remaining -= tokens
    } else {
      deferred.push(layer)
    }
  }

  if (remaining > 0 && deferred.length > 0) {
    const share = Math.floor(remaining / deferred.length)
    const remainder = remaining % deferred.length

    deferred.forEach((layer, index) => {
      const grant = share + (index === deferred.length - 1 ? remainder : 0)
      if (grant <= 0) return
      const truncated = truncateToTokenBudget(layer.content, grant)
      if (!truncated) return
      included.set(layer.id, truncated)
      markIncluded(layer.id, true)
      remaining -= estimateTokens(truncated)
    })
  }

  const contents = candidates.filter((l) => included.has(l.id)).map((l) => included.get(l.id) as string)
  return { contents, usedTokens: budget - remaining }
}

// Phase 2/3/4 (Sprint PR-04, packing rewritten Sprint PR-06) — computes a
// per-layer token report (Phase 2), then fits layers into `totalBudget`
// strictly in priority order: Priority 0 is always included in full;
// Priority 1 gets whatever budget remains after Priority 0, best-fit packed
// (see packLayers above) only if it doesn't all fit whole; Priority 2 gets
// only what's left after that, so it is the first and most aggressively
// compressed tier — matching the brief's "Compression hanya boleh dimulai
// dari Priority 2. Jika masih melebihi budget, baru Priority 1." Priority 0
// is NEVER truncated or dropped: if it alone exceeds `totalBudget` even with
// Priority 1/2 fully removed, this returns `ok: false` with a clear reason
// instead (Phase 4).
export function compressPromptByLayers(layers: PromptLayer[], totalBudget = DEFAULT_LAYER_TOTAL_BUDGET): LayeredCompressionResult {
  const report: LayerTokenReport[] = layers.map((layer) => ({
    id: layer.id,
    label: layer.label,
    priority: layer.priority,
    tokens: layerTokens(layer),
    included: false,
    truncated: false,
  }))

  const markIncluded = (id: string, truncated = false) => {
    const entry = report.find((r) => r.id === id)
    if (entry) {
      entry.included = true
      entry.truncated = truncated
    }
  }

  const nonEmpty = (priority: PromptLayerPriority) => layers.filter((l) => l.priority === priority && l.content.trim().length > 0)

  const p0 = nonEmpty(0)
  const p1 = nonEmpty(1)
  const p2 = nonEmpty(2)

  const p0Tokens = p0.reduce((sum, l) => sum + layerTokens(l), 0)

  if (p0Tokens > totalBudget) {
    return {
      ok: false,
      compressed: '',
      error: `Priority 0 (Identity Lock/Model Thobe/Look Cutting/Material/Material Color) membutuhkan ${p0Tokens} token, melebihi budget ${totalBudget} token. Render dibatalkan — Prompt Compression tidak diizinkan menghapus konten Priority 0 untuk memuatnya.`,
      totalTokens: p0Tokens,
      layerReport: report,
    }
  }

  p0.forEach((l) => markIncluded(l.id))
  let remaining = totalBudget - p0Tokens

  // Priority 1 served first (from what's left after Priority 0) so it
  // survives longer than Priority 2 under a tight budget.
  const p1Result = packLayers(p1, remaining, markIncluded)
  remaining -= p1Result.usedTokens
  const p2Result = packLayers(p2, remaining, markIncluded)
  remaining -= p2Result.usedTokens

  const compressed = [...p0.map((l) => l.content), ...p1Result.contents, ...p2Result.contents].filter(Boolean).join('. ')
  const totalTokens = totalBudget - remaining

  return { ok: true, compressed, error: null, totalTokens, layerReport: report }
}

export interface PriorityZeroValidation {
  valid: boolean
  missing: string[]
}

// Phase 5 (Sprint PR-04) — final safety net immediately before the OpenAI
// call. `requiredIds` is supplied by the caller, not re-derived here: only
// the caller (route.ts) knows which Priority 0 layers were actually
// applicable to THIS request (Identity/Model Thobe/Material/Material Color
// are always required once Capability Engine hasn't already blocked the
// render; Look Cutting is required only when the customer selected a real
// one — it is a legitimate "(None)" optional field, so its absence on its
// own is not an error). A layer missing here means it had empty content or
// (in principle) failed to survive compression — either way, the request
// must be cancelled rather than sent to OpenAI without it.
export function validatePriorityZeroIntact(report: LayerTokenReport[], requiredIds: string[]): PriorityZeroValidation {
  const missing = requiredIds.filter((id) => {
    const entry = report.find((r) => r.id === id)
    return !entry || !entry.included
  })
  return { valid: missing.length === 0, missing }
}
