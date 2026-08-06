import { formatRecord } from './serializer'
import type { RenderRecipeEntry, MasterRenderRecipe } from '@/lib/design/recipeComposer/types'
import { masterDataCategoryLabel, type MasterDataCategory } from '@/lib/design/masterData'
import { REFERENCE_USAGE_POLICY as REFERENCE_USAGE_POLICY_CONTENT } from '@/lib/design/renderEngine/referenceUsagePolicy'

// Prompt Builder — Layer-Based Compression (Prompt Architecture Realignment,
// 2026-08-06). This module IS the Prompt Builder: it assembles the 13 fixed
// sections the locked architecture requires, in a fixed order that never
// changes, then fits that assembly into a token budget without ever
// reordering it.
//
// The 13 sections, in the order they are always emitted:
//   1. Identity Preservation   7. Color
//   2. Reference Binding       8. Global Quality Rules
//   3. Reference Usage Policy  9. Collar
//   4. Scene Configuration    10. Placket
//   5. Garment Layout         11. Pocket
//   6. Material               12. Cuff
//                             13. Final Constraints
//
// Ordering and truncation are DECOUPLED on purpose: `priority` (0/1/2)
// governs how aggressively a layer may be truncated under budget pressure,
// never where it appears in the final string. compressPromptByLayers below
// assembles the final string by walking the layers in their ORIGINAL push
// order (see the `layers` array itself), using whatever content each layer
// ended up with (full or truncated) — never regrouped by priority tier, so
// "Jangan mengubah urutan" holds even when the budget is tight.
//
// Word/token conversion is a rough approximation only (no real tokenizer
// dependency here): 1 word ~= 1.3 tokens.
const WORDS_PER_TOKEN = 1 / 1.3

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

export type PromptLayerPriority = 0 | 1 | 2

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
  // Non-null only when ok === false — Priority 0 could not fit even with
  // Priority 1/2 fully removed. This is the one situation where
  // compressPromptByLayers refuses to produce a prompt at all, rather than
  // silently deleting required content to make room.
  error: string | null
  totalTokens: number
  layerReport: LayerTokenReport[]
}

// Named component steps 9-12 — fixed order, per the locked architecture.
// Priority 1: compressible/skippable under budget pressure (the customer
// may not have selected one), never Priority 0.
const NAMED_COMPONENT_STEPS: { id: string; label: string; category: MasterDataCategory }[] = [
  { id: 'collar', label: 'Collar', category: 'kerah' },
  { id: 'placket', label: 'Placket', category: 'plaket' },
  { id: 'pocket', label: 'Pocket', category: 'saku' },
  { id: 'cuff', label: 'Cuff', category: 'manset' },
]

// Extension components — categories with no named slot in the locked
// 13-step architecture (Embroidery/Handmade Zig-Zag/Accessory), but with
// real, currently-in-use business value (real catalog categories, real
// customer selections) that the brief does not ask to remove. Kept as
// additive, optional, skip-if-not-selected steps immediately after Cuff and
// before Final Constraints — the same position they held (as the tail of
// SELECTED_COMPONENT_CATEGORIES) before this realignment, so nothing about
// their own behavior changes, only their neighbors' names/positions.
const EXTENSION_COMPONENT_CATEGORIES: MasterDataCategory[] = ['bordir', 'handmade_zigzag', 'aksesori']

// One entry's own resolved content only — garment (DNA Resolver's per-item
// output, containing `referenceInstruction`/`placement`/`color`) plus its
// own fabricIdentity/fabricBehavior (per-item sensory fields Recipe
// Composer would otherwise merge across items). Never reads another
// entry's data, so no cross-item collision is possible here.
function formatEntryContent(entry: RenderRecipeEntry): string {
  return [formatRecord(entry.recipe.garment), formatRecord(entry.recipe.fabricIdentity), formatRecord(entry.recipe.fabricBehavior)]
    .filter(Boolean)
    .join(', ')
}

// A component's full Prompt Builder step content: its own resolved
// reference/structural text (formatEntryContent), then its resolved
// Component Rules (Component Default Knowledge + Component Delta
// Knowledge, from Recipe Composer's componentRulesByCategory — see
// recipeComposer/composer.ts). Component Rules are joined as plain
// sentences: each entry is already a complete, self-contained instruction
// ("Preserve the Rounded collar shape...", "Do not modify the inherited
// Standard Collar dimensions.") — no "Preserve:"/"Avoid:" wrapper needed at
// this level (that wrapper stays Engine-only, see buildGarmentLayoutContent/
// buildFinalConstraintsContent below), since componentRules is one merged
// list now, not two.
//
// Final Repository Cleanup (2026-08-06) — no longer appends a "Component
// Reference Delta" ("Transfer only: .../Do NOT copy: ...", previously
// sourced from aiAssetComposer/registry.ts). That content is neither an
// Engine section nor Master Data — per this sprint's own definition of what
// the Final Prompt may be built from ("Engine + Master Data, selain itu
// dianggap legacy"), it no longer belongs in the assembled prompt. The Hero
// Image itself (and its binding/geometry role, stated once in Reference
// Binding/Reference Usage Policy) is unaffected — only this extra per-
// component caption text is removed. aiAssetComposer/registry.ts's
// constants and componentReferenceDeltas() are untouched (still used
// elsewhere, e.g. the DNA Debug Viewer) — only this Builder-side consumer
// stopped reading them.
function buildComponentStepContent(entry: RenderRecipeEntry, masterRecipe: MasterRenderRecipe | null): string {
  const componentRules = masterRecipe?.componentRulesByCategory[entry.category] ?? []
  return [formatEntryContent(entry), componentRules.join(' ')].filter(Boolean).join(' ')
}

// Section 4 — Scene Configuration (camera/lighting/composition/background/
// visibility). Each field is "policy baseline, item overrides" (Recipe
// Composer), never a per-component concern.
function buildSceneConfigurationContent(masterRecipe: MasterRenderRecipe | null): string {
  if (!masterRecipe) return ''
  const parts = [
    formatRecord(masterRecipe.camera),
    formatRecord(masterRecipe.lighting),
    formatRecord(masterRecipe.composition),
    formatRecord(masterRecipe.background),
    formatRecord(masterRecipe.visibilityRules),
  ].filter(Boolean)

  return parts.join(', ')
}

// Section 5 — Garment Layout. Engine's own positive garment framing
// (masterRecipe.garmentLayoutRules — GARMENT_LAYOUT_RULES plus Look
// Cutting's own resolved Component Rules when selected, see
// recipeComposer/composer.ts) wrapped the same "Preserve: ..." way the
// prior lockRules layer always was, preceded by Look Cutting's own
// referenceInstruction (fit/ease/drape prose) when selected — Look Cutting
// has no dedicated Prompt Builder step (it is a fit delta, not a discrete
// visual reference component), so this is the one place its content is
// emitted.
//
// Builder Cleanup (2026-08-06) — Repository/Engine unchanged by this fix
// ("Repository sudah benar," only the Builder was wrong): Look Cutting's
// own Repository content (referenceInstruction) can now be byte-identical
// to one of the Engine's own Garment Layout rules, and emitting both
// produced a literal duplicate sentence in the Final Prompt. Fixed
// generally, not as a one-off string match against today's specific
// wording: every string value Look Cutting's own garment record
// contributes is checked against the Engine's `rules` array — only when
// EVERY one of them is already present there verbatim (and there's no
// other fabricIdentity/fabricBehavior content that would be lost) is Look
// Cutting's contribution omitted, since at that point it says nothing the
// Engine hasn't already said. A future Look Cutting item whose
// referenceInstruction genuinely differs from the Engine's rules is still
// included normally — this only suppresses true, full duplication.
function isFullyRedundantWithGarmentLayoutRules(entry: RenderRecipeEntry, rules: string[]): boolean {
  if (rules.length === 0) return false
  const garmentValues = Object.values(entry.recipe.garment ?? {}).filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  )
  if (garmentValues.length === 0) return false
  const hasOtherContent = Boolean(formatRecord(entry.recipe.fabricIdentity) || formatRecord(entry.recipe.fabricBehavior))
  if (hasOtherContent) return false
  return garmentValues.every((value) => rules.includes(value))
}

function buildGarmentLayoutContent(masterRecipe: MasterRenderRecipe | null, lookCuttingEntry: RenderRecipeEntry | undefined): string {
  const parts: string[] = []
  const rules = (masterRecipe?.garmentLayoutRules ?? []).filter(Boolean)
  if (lookCuttingEntry && !isFullyRedundantWithGarmentLayoutRules(lookCuttingEntry, rules)) {
    parts.push(formatEntryContent(lookCuttingEntry))
  }
  if (rules.length > 0) parts.push(`Preserve: ${rules.join(', ')}.`)
  return parts.filter(Boolean).join(' ')
}

// Section 8 — Global Quality Rules. Policy-only field, no per-item override
// exists for it.
function buildGlobalQualityRulesContent(masterRecipe: MasterRenderRecipe | null): string {
  if (!masterRecipe) return ''
  return formatRecord(masterRecipe.quality)
}

// Section 13 — Final Constraints. Engine-only negative safety net
// (masterRecipe.finalConstraintRules — FINAL_CONSTRAINTS, no per-component
// contribution), wrapped the same "Avoid: ..." way the prior negativeRules
// layer always was. Positioned last by push order (see buildPromptLayers),
// not merely "Priority 0" — see this file's own header comment on why
// ordering and truncation tier are decoupled.
function buildFinalConstraintsContent(masterRecipe: MasterRenderRecipe | null): string {
  const rules = (masterRecipe?.finalConstraintRules ?? []).filter(Boolean)
  return rules.length > 0 ? `Avoid: ${rules.join(', ')}.` : ''
}

export interface BuildPromptLayersInput {
  entries: RenderRecipeEntry[]
  masterRecipe: MasterRenderRecipe | null
  // Section 1 — static Engine template (renderEngine/identityPreservation.ts).
  identityPreservation: string
  // Section 2 — built by the caller (route.ts already knows which images are
  // actually active this render — see renderEngine/referenceBinding.ts).
  // Empty string when no reference image qualifies (customer photo alone
  // never triggers this — see buildReferenceBinding's own gate).
  referenceBinding: string
  // Section 3 — whether Reference Usage Policy applies to this render at
  // all (true whenever Base Hero or any geometry-type reference is active).
  // Content itself (REFERENCE_USAGE_POLICY) is a fixed Engine constant, not
  // caller-supplied.
  referenceUsagePolicy: boolean
}

// Assembles the 13 fixed sections (plus optional Extension Components,
// additive, never reordering the 13) into PromptLayer candidates, in the
// exact order the locked architecture specifies. A category with no
// resolved entry (never selected, or selected as the design-level "(None)"
// sentinel) simply produces no layer for that step (Collar/Placket/Pocket/
// Cuff/extensions) — required steps (Identity/Scene Configuration/Garment
// Layout/Material/Color/Global Quality Rules/Final Constraints) always
// produce a layer, empty content if genuinely nothing to say.
export function buildPromptLayers(input: BuildPromptLayersInput): PromptLayer[] {
  const { entries, masterRecipe, identityPreservation, referenceBinding, referenceUsagePolicy } = input

  const byCategory = new Map<MasterDataCategory, RenderRecipeEntry>()
  entries.forEach((entry) => {
    if (!byCategory.has(entry.category)) byCategory.set(entry.category, entry)
  })

  const layers: PromptLayer[] = []

  // 1. Identity Preservation
  layers.push({ id: 'identity_preservation', label: 'Identity Preservation', priority: 0, content: identityPreservation })

  // 2. Reference Binding
  if (referenceBinding) {
    layers.push({ id: 'reference_binding', label: 'Reference Binding', priority: 0, content: referenceBinding })
  }

  // 3. Reference Usage Policy
  if (referenceUsagePolicy) {
    layers.push({
      id: 'reference_usage_policy',
      label: 'Reference Usage Policy',
      priority: 0,
      content: REFERENCE_USAGE_POLICY_CONTENT,
    })
  }

  // 4. Scene Configuration
  layers.push({ id: 'scene_configuration', label: 'Scene Configuration', priority: 0, content: buildSceneConfigurationContent(masterRecipe) })

  // 5. Garment Layout
  layers.push({
    id: 'garment_layout',
    label: 'Garment Layout',
    priority: 0,
    content: buildGarmentLayoutContent(masterRecipe, byCategory.get('look_cutting')),
  })

  // 6. Material
  const materialEntry = byCategory.get('bahan')
  layers.push({
    id: 'material',
    label: 'Material',
    priority: 0,
    content: materialEntry ? buildComponentStepContent(materialEntry, masterRecipe) : '',
  })

  // 7. Color — referenceInstruction only, per the locked Master Data shape
  // (Color carries no componentRules and has no Hero Image mechanism).
  const colorEntry = byCategory.get('warna_bahan')
  layers.push({ id: 'color', label: 'Color', priority: 0, content: colorEntry ? formatEntryContent(colorEntry) : '' })

  // 8. Global Quality Rules
  layers.push({ id: 'global_quality_rules', label: 'Global Quality Rules', priority: 0, content: buildGlobalQualityRulesContent(masterRecipe) })

  // 9-12. Collar, Placket, Pocket, Cuff — fixed order, skip if not selected.
  NAMED_COMPONENT_STEPS.forEach(({ id, label, category }) => {
    const entry = byCategory.get(category)
    if (!entry) return
    layers.push({
      id: `component:${id}`,
      label,
      priority: 1,
      content: buildComponentStepContent(entry, masterRecipe),
    })
  })

  // Extension Components — additive, not part of the fixed 13, positioned
  // after Cuff and before Final Constraints (see this file's own comment).
  EXTENSION_COMPONENT_CATEGORIES.forEach((category) => {
    const entry = byCategory.get(category)
    if (!entry) return
    layers.push({
      id: `component:${category}`,
      label: masterDataCategoryLabel(category),
      priority: 1,
      content: buildComponentStepContent(entry, masterRecipe),
    })
  })

  // 13. Final Constraints
  layers.push({ id: 'final_constraints', label: 'Final Constraints', priority: 0, content: buildFinalConstraintsContent(masterRecipe) })

  return layers
}

function layerTokens(layer: PromptLayer): number {
  return estimateTokens(layer.content)
}

// Default budget — re-measured against real data across several sprints
// (270 -> 1200 -> 1800). Unchanged by this realignment; still the pipeline's
// own token-cost tracking, not an OpenAI limit (gpt-image-1 has no
// prompt-length constraint anywhere near this range).
const DEFAULT_LAYER_TOTAL_BUDGET = 1800

interface PackResult {
  included: Map<string, string>
  usedTokens: number
}

// Importance-Ordered packing — each candidate that fits whole in what's left
// is taken whole, in the caller's own order; a candidate that doesn't fit is
// deferred, not fatal, so a later, smaller candidate still gets its shot at
// remaining budget. Whatever budget is left over after Pass 1 is split
// evenly across every deferred candidate in Pass 2 (fair-share truncation),
// remainder going to the FIRST deferred one. Returns a Map so the caller can
// re-walk the ORIGINAL layer order when assembling the final string — this
// function itself never decides final output order, only which layers make
// it in and how much of each survives.
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

  return { included, usedTokens: budget - remaining }
}

// Fits `layers` into `totalBudget` strictly by priority tier (Priority 0 is
// always included in full; Priority 1 gets whatever budget remains after
// Priority 0, best-fit packed, only if it doesn't all fit whole; Priority 2
// gets only what's left after that) — but the FINAL assembled string always
// walks `layers` in its original push order (the fixed 13-step order,
// see buildPromptLayers), never grouped by tier. Priority governs how much
// of a layer survives; it never decides where that layer appears. Priority
// 0 is NEVER truncated or dropped: if it alone exceeds `totalBudget` even
// with Priority 1/2 fully removed, this returns `ok: false` instead.
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
      error: `Priority 0 (Identity Preservation/Reference Binding/Reference Usage Policy/Scene Configuration/Garment Layout/Material/Color/Global Quality Rules/Final Constraints) membutuhkan ${p0Tokens} token, melebihi budget ${totalBudget} token. Render dibatalkan — Prompt Compression tidak diizinkan menghapus konten Priority 0 untuk memuatnya.`,
      totalTokens: p0Tokens,
      layerReport: report,
    }
  }

  const includedContent = new Map<string, string>()
  p0.forEach((l) => {
    includedContent.set(l.id, l.content)
    markIncluded(l.id)
  })
  let remaining = totalBudget - p0Tokens

  // Priority 1 served first (from what's left after Priority 0) so it
  // survives longer than Priority 2 under a tight budget.
  const p1Result = packLayers(p1, remaining, markIncluded)
  p1Result.included.forEach((content, id) => includedContent.set(id, content))
  remaining -= p1Result.usedTokens
  const p2Result = packLayers(p2, remaining, markIncluded)
  p2Result.included.forEach((content, id) => includedContent.set(id, content))
  remaining -= p2Result.usedTokens

  // Final assembly walks the ORIGINAL fixed order (`layers`), not grouped
  // by priority tier — this is what makes "Jangan mengubah urutan" hold
  // even when Priority 1 components got truncated or dropped.
  const compressed = layers
    .filter((l) => includedContent.has(l.id))
    .map((l) => includedContent.get(l.id) as string)
    .join('. ')
  const totalTokens = totalBudget - remaining

  return { ok: true, compressed, error: null, totalTokens, layerReport: report }
}

export interface PriorityZeroValidation {
  valid: boolean
  missing: string[]
}

// Final safety net immediately before the OpenAI call. `requiredIds` is
// supplied by the caller, not re-derived here: only the caller (route.ts)
// knows which Priority 0 layers were actually applicable to THIS request. A
// layer missing here means it had empty content or (in principle) failed to
// survive compression — either way, the request must be cancelled rather
// than sent to OpenAI without it.
export function validatePriorityZeroIntact(report: LayerTokenReport[], requiredIds: string[]): PriorityZeroValidation {
  const missing = requiredIds.filter((id) => {
    const entry = report.find((r) => r.id === id)
    return !entry || !entry.included
  })
  return { valid: missing.length === 0, missing }
}
