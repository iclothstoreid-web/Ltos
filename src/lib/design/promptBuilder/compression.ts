import type { RenderInstruction } from './types'
import { formatRecord } from './serializer'
import { applyLockRulesIfReferenceBacked } from './lockRules'
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
//
// Reference-First (Sprint R-02) — `referenceBacked` is threaded in from
// aiAssetComposer's referenceBackedCategories (computed once per request in
// route.ts from the SAME composeAiAssets() result that decided which Hero
// Images are actually being sent). When this entry's own category is
// reference-backed, its `garment` record is pruned to Lock Rules only
// (lockRules.ts) BEFORE formatting — the narrative geometry/construction/
// appearance/materials/stitching text a photo already conveys is dropped,
// while placement/color/negativeRules-adjacent content and everything else
// still reaches the prompt untouched. `fabricIdentity`/`fabricBehavior` are
// never pruned — Reference-First only ever concerns `garment` (see
// lockRules.ts's own doc comment on scope).
function formatEntryContent(entry: RenderRecipeEntry, referenceBacked: Set<MasterDataCategory>): string {
  const garment = applyLockRulesIfReferenceBacked(entry.recipe.garment, entry.category, referenceBacked)
  return [formatRecord(garment), formatRecord(entry.recipe.fabricIdentity), formatRecord(entry.recipe.fabricBehavior)]
    .filter(Boolean)
    .join(', ')
}

// Visual Description (Priority 2) — mood/framing only. `negativeRules` used
// to be folded into this layer's own text (see git history), which meant
// Identity/Garment Lock reinforcement ("thobe replaced by shirt", "face/
// age/body shape changed" — recipeComposer/types.ts's DEFAULT_GLOBAL_
// RENDER_POLICY) shared P2's fate: first in line for compression, and per
// Sprint R-03's audit (PLAN_SPRINT_R03), proven to hit ZERO tokens under
// every realistic budget once a render has more than a couple of Priority 1
// components. A negative constraint isn't mood — losing it under budget
// pressure is a correctness bug (GPT Image free to swap the whole garment),
// not a quality tradeoff. Sprint R-04 moves it to its own layer (see
// buildNegativeRulesContent / the 'negative_rules' layer below).
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

  return parts.join(', ')
}

// Sprint R-04 — negativeRules promoted out of Visual Description into its
// own Priority 0 layer. Same "Avoid: ..." phrasing GPT Image needs (no
// dedicated negative-prompt parameter — see serializer.ts's own rationale),
// just no longer sharing P2's compression fate. Empty when nothing has
// contributed a negative rule yet (GlobalRenderPolicy always has 5 by
// default, so in practice this is non-empty on every real render — see
// route.ts's requiredPriorityZeroIds, which only requires this layer when
// masterRecipe actually produced at least one).
function buildNegativeRulesContent(masterRecipe: MasterRenderRecipe | null): string {
  const negatives = (masterRecipe?.negativeRules ?? []).filter(Boolean)
  return negatives.length > 0 ? `Avoid: ${negatives.join(', ')}.` : ''
}

// Sprint R-04 — an AI Asset caveat instruction (SILHOUETTE-only, COLLAR_
// SHAPE-only, etc. — aiAssetComposer/composer.ts's MODEL_REFERENCE_
// SILHOUETTE_INSTRUCTION and siblings) as a layer candidate. These used to
// be string-concatenated onto `finalPrompt` AFTER compressPromptByLayers
// had already finished (`applyAssetInstructions`, called post-compression
// in route.ts) — meaning the token budget audited by Sprint R-03 never
// actually matched what reached OpenAI. Folding them in as Priority 0
// layers makes `layerReport`/`totalTokens` the real, complete accounting:
// what's reported is what's sent, nothing appended afterward.
export interface AssetInstructionLayer {
  id: string
  label: string
  content: string
}

export interface BuildPromptLayersInput {
  entries: RenderRecipeEntry[]
  // Only read for the Priority 2 Visual Description layer (camera/lighting/
  // composition/background/quality/pose/visibilityRules) and the Priority 0
  // Negative Rules layer (negativeRules) — Recipe Composer's own merge is
  // unchanged and still the source for those fields; Priority 0/1 DNA
  // layers below never read from it.
  masterRecipe: MasterRenderRecipe | null
  identityTemplate: string
  // Reference-First (Sprint R-02) — categories whose Hero Image is actually
  // being sent this render (aiAssetComposer's referenceBackedCategories).
  // Optional and defaults to empty so every existing caller that doesn't
  // pass it (Render Test Framework scripts, any future ad-hoc caller) keeps
  // getting the pre-R-02 behavior: full DNA text for every category,
  // exactly as before.
  referenceBackedCategories?: Set<MasterDataCategory>
  // Sprint R-04 — caller-supplied (route.ts already knows which AI Assets
  // composeAiAssets() actually activated for this request; this module
  // never re-derives that). Optional and defaults to none, so an existing
  // caller that doesn't pass it (Render Test Framework, any future ad-hoc
  // script) behaves exactly as before: no caveat layers, nothing appended
  // anywhere else either (callers that still concatenate them externally,
  // e.g. the DNA Debug Viewer's legacy V1 display, are unaffected).
  assetInstructions?: AssetInstructionLayer[]
}

// Phase 1 (Sprint PR-04) — splits the render into the 7 layers the brief
// specifies. A category with no resolved entry (never selected, or
// selected as the design-level "(None)" sentinel — which never reaches
// `entries` at all, see design-studio/types.ts's OPTIONAL_FIELDS) simply
// produces an empty-content layer for Priority 0 slots (Look Cutting) or is
// skipped entirely for Priority 1 slots (Selected Components) — "Skip
// otomatis jika NONE" per the brief.
export function buildPromptLayers(input: BuildPromptLayersInput): PromptLayer[] {
  const { entries, masterRecipe, identityTemplate, referenceBackedCategories = new Set<MasterDataCategory>(), assetInstructions = [] } = input

  const byCategory = new Map<MasterDataCategory, RenderRecipeEntry>()
  entries.forEach((entry) => {
    if (!byCategory.has(entry.category)) byCategory.set(entry.category, entry)
  })

  const layers: PromptLayer[] = []

  layers.push({ id: 'identity', label: 'Identity Lock', priority: 0, content: identityTemplate })

  // Sprint R-04 — Negative Rules is a hard constraint (Identity/Garment Lock
  // reinforcement), not P2 mood text; see buildNegativeRulesContent's doc
  // comment. Pushed here, alongside Identity Lock, so it always competes for
  // budget as Priority 0 — included in full or the render refuses, exactly
  // like Model Thobe/Material/Material Color (compressPromptByLayers'
  // Phase 4 gate), never silently compressed away.
  layers.push({ id: 'negative_rules', label: 'Negative Rules (Constraint)', priority: 0, content: buildNegativeRulesContent(masterRecipe) })

  // Sprint R-04 — AI Asset caveat instructions, now real Priority 0 layers
  // instead of text appended after compression finished (see
  // AssetInstructionLayer's doc comment above). Only ever non-empty when
  // route.ts actually composed a reference for this category this request.
  assetInstructions.forEach((instruction) => {
    layers.push({ id: instruction.id, label: instruction.label, priority: 0, content: instruction.content })
  })

  const modelThobeEntry = byCategory.get('model_thobe')
  layers.push({ id: 'model_thobe', label: 'Model Thobe', priority: 0, content: modelThobeEntry ? formatEntryContent(modelThobeEntry, referenceBackedCategories) : '' })

  const lookCuttingEntry = byCategory.get('look_cutting')
  layers.push({ id: 'look_cutting', label: 'Look Cutting', priority: 0, content: lookCuttingEntry ? formatEntryContent(lookCuttingEntry, referenceBackedCategories) : '' })

  const bahanEntry = byCategory.get('bahan')
  layers.push({ id: 'material', label: 'Material', priority: 0, content: bahanEntry ? formatEntryContent(bahanEntry, referenceBackedCategories) : '' })

  const warnaEntry = byCategory.get('warna_bahan')
  layers.push({ id: 'material_color', label: 'Material Color', priority: 0, content: warnaEntry ? formatEntryContent(warnaEntry, referenceBackedCategories) : '' })

  SELECTED_COMPONENT_CATEGORIES.forEach((category) => {
    const entry = byCategory.get(category)
    if (!entry) return
    layers.push({ id: `component:${category}`, label: masterDataCategoryLabel(category), priority: 1, content: formatEntryContent(entry, referenceBackedCategories) })
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

// Importance-Ordered packing (Sprint PR-06, re-ordered Sprint R-04) —
// replaces the old single-pass greedy scan that BROKE the instant one
// candidate didn't fit whole, silently discarding every candidate still
// left in the queue no matter how small. That's what let Plaket Hexagonal's
// 697-token DNA zero out the budget via Manset's truncation and take Saku's
// 52-token pocket layer down with it, even though 52 tokens of room
// genuinely existed — confirmed in production PAT-01/02 (2026-07-31):
// `component:plaket` and `component:saku` both came back `included: false`,
// and the render showed no hexagon and no pocket at all.
//
// Sprint PR-06's fix kept BOTH problems' fix AND a new one: it sorted
// candidates smallest-token-first for the "does it fit whole" scan, which
// means SIZE — not priority, not which component the customer actually
// selected first, not how visually central it is — decided who gets a
// whole slot. Sprint R-03's audit (PLAN_SPRINT_R03) measured the result:
// Plaket (697 tokens, the single largest Priority 1 layer, and often the
// most visually dominant selected component) was *structurally* always
// last in line, penalized purely for verbosity, and left with whatever
// leftover fair-share crumbs remained — regardless of how important the
// motif it describes actually is.
//
// Sprint R-04 fixes the ordering itself: Pass 1 now scans candidates in
// their ORIGINAL order (priority tier already separated the caller's own
// candidates array into P0/P1/P2 batches; within a batch, `candidates`
// arrives in `SELECTED_COMPONENT_CATEGORIES`' fixed anatomical order —
// Kerah > Manset > Plaket > Saku > Bordir > Handmade Zig-Zag > Aksesori —
// the only existing, stable importance signal in this codebase; inventing
// a new per-item importance score is explicitly out of scope this sprint).
// Size no longer decides WHICH candidate gets a whole slot; it only decides
// HOW MUCH of the truncated remainder each deferred candidate is fairly
// entitled to in Pass 2 — a purely arithmetic role, not a selection one.
//
// Two passes, no break:
//   Pass 1 (importance order, not size order) — each candidate that fits
//   whole in what's left is taken whole, in the caller's own order. A
//   candidate that doesn't fit is deferred, not fatal — the scan keeps
//   going, so a later, smaller candidate still gets its shot at whatever
//   budget remains (unchanged from PR-06: still no early break).
//   Pass 2 (fair-share truncation) — whatever budget Pass 1 left over is
//   split evenly across every deferred candidate, remainder going to the
//   FIRST deferred one (the most important, per Pass 1's own order) rather
//   than the last, so being big no longer means being least-prioritized
//   twice over. Every deferred component still ends up with SOME
//   representation rather than a lucky few getting everything.
// Output order follows the original `candidates` order — sorting never
// happens at all now; the caller's own order drives both the fit decision
// and the output.
function packLayers(candidates: PromptLayer[], budget: number, markIncluded: (id: string, truncated?: boolean) => void): PackResult {
  let remaining = budget
  const included = new Map<string, string>()
  const deferred: PromptLayer[] = []

  for (const layer of candidates) {
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
      const grant = share + (index === 0 ? remainder : 0)
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
      error: `Priority 0 (Identity Lock/Negative Rules/AI Asset Instructions aktif/Model Thobe/Look Cutting/Material/Material Color) membutuhkan ${p0Tokens} token, melebihi budget ${totalBudget} token. Render dibatalkan — Prompt Compression tidak diizinkan menghapus konten Priority 0 untuk memuatnya.`,
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
