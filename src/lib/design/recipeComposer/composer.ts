import { resolveComponentKnowledge } from '@/lib/design/componentDefaultKnowledge/resolver'
import type { MasterDataCategory } from '@/lib/design/masterData'
import type { GlobalRenderPolicy, MasterRenderRecipe, RecipeSource, RenderRecipeEntry } from './types'

// Recipe Composer Foundation — real normalize/validate/merge/resolve-conflict
// logic. Prompt Builder itself must never call mergeRecordField/
// resolveRecipeConflict/sortRecipePriority directly — this module is the
// only place allowed to combine Recipes.

export interface ComposeRenderRecipeInput {
  entries: RenderRecipeEntry[]
  policy: GlobalRenderPolicy
}

// The 11 fields RenderRecipe and MasterRenderRecipe both have — the only
// ones a Component Recipe can actually contribute to. `background`/
// `quality`/`style` exist only on GlobalRenderPolicy (applied once, not
// per-item — see composeRenderRecipe) and are deliberately excluded here.
export const RECIPE_RECORD_FIELDS = [
  'camera',
  'pose',
  'lighting',
  'composition',
  'focus',
  'fabricBehavior',
  'visibilityRules',
  'garment',
  'fabricIdentity',
  'stitching',
  'embroidery',
] as const
export type RecipeRecordField = (typeof RECIPE_RECORD_FIELDS)[number]

function normalizeRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

// Defensive shape guarantee only — never invents a field the RenderRecipe
// contract doesn't already declare (see design/renderRecipe/types.ts). A
// missing/null record just becomes {} so merge never throws on a
// partially-built Component Recipe.
export function normalizeRenderRecipeEntries(entries: RenderRecipeEntry[]): RenderRecipeEntry[] {
  return entries.map((entry) => ({
    ...entry,
    recipe: {
      ...entry.recipe,
      camera: normalizeRecord(entry.recipe.camera),
      pose: normalizeRecord(entry.recipe.pose),
      lighting: normalizeRecord(entry.recipe.lighting),
      composition: normalizeRecord(entry.recipe.composition),
      focus: normalizeRecord(entry.recipe.focus),
      fabricBehavior: normalizeRecord(entry.recipe.fabricBehavior),
      visibilityRules: normalizeRecord(entry.recipe.visibilityRules),
      garment: normalizeRecord(entry.recipe.garment),
      fabricIdentity: normalizeRecord(entry.recipe.fabricIdentity),
      stitching: normalizeRecord(entry.recipe.stitching),
      embroidery: normalizeRecord(entry.recipe.embroidery),
      renderPriority: Array.isArray(entry.recipe.renderPriority) ? entry.recipe.renderPriority : [],
      componentRules: Array.isArray(entry.recipe.componentRules) ? entry.recipe.componentRules : [],
    },
  }))
}

export interface RenderRecipeEntryValidation {
  valid: boolean
  errors: string[]
}

// Structural only — checks what normalizeRenderRecipeEntries + the merge
// step both need to be present; never judges whether a recipe's content is
// "correct" for a garment (no such rule exists yet).
export function validateRenderRecipeEntries(entries: RenderRecipeEntry[]): RenderRecipeEntryValidation {
  const errors: string[] = []

  entries.forEach((entry) => {
    if (!entry.itemId) {
      errors.push('Component Recipe tanpa itemId.')
    }
    if (typeof entry.priority !== 'number' || Number.isNaN(entry.priority)) {
      errors.push(`Component Recipe "${entry.itemId || 'unknown'}" tidak memiliki priority yang valid.`)
    }
    if (entry.recipe.status === 'empty') {
      errors.push(`Component Recipe "${entry.itemId}" masih berstatus empty — belum ada data untuk digabung.`)
    }
  })

  return { valid: errors.length === 0, errors }
}

export interface RecipeConflictCandidate {
  value: unknown
  source: RenderRecipeEntry
}

export interface RecipeConflict {
  field: keyof MasterRenderRecipe
  candidates: RecipeConflictCandidate[]
}

export interface RecipeConflictResolution {
  field: keyof MasterRenderRecipe
  resolvedValue: unknown
  resolvedFrom: RenderRecipeEntry | null
}

// Higher `priority` wins — sortRecipePriority orders entries ascending
// (Model=0 before Collar=1 before Pocket=2, matching RenderRecipeEntry's
// own doc comment), so the highest-priority contributor is the most
// specific item (e.g. Pocket's own close-up camera hint should win over
// Model's generic full-body one when both set the same key).
//
// Exception — `garment` Anchor rule: DNA Resolver's buildGarmentSpec maps
// EVERY component's AI Design DNA onto the same unnamespaced keys
// (referenceInstruction/placement, or `color` for warna_bahan — see
// dnaResolver/resolver.ts). Without an exception, a same-key collision on
// `garment` would let whichever component merges with the highest priority
// silently clobber another's own referenceInstruction. This diagnostic
// merge (MasterRenderRecipe.garment) is no longer what Prompt Builder reads
// for component content (each component's own step reads `entries`
// directly — see promptBuilder/compression.ts), but it stays correct for
// composeRenderRecipeTrace and any future debugging consumer. Model Thobe
// is the Anchor: on `garment` only, if Model Thobe is among the candidates
// it always wins the collision, regardless of priority. Every other field
// (camera, lighting, ...) keeps the original priority-wins rule unchanged.
export function resolveRecipeConflict(conflict: RecipeConflict): RecipeConflictResolution {
  if (conflict.candidates.length === 0) {
    return { field: conflict.field, resolvedValue: null, resolvedFrom: null }
  }

  if (conflict.field === 'garment') {
    const anchor = conflict.candidates.find((candidate) => candidate.source.category === 'model_thobe')
    if (anchor) {
      return { field: conflict.field, resolvedValue: anchor.value, resolvedFrom: anchor.source }
    }
  }

  const winner = conflict.candidates.reduce((highest, candidate) =>
    candidate.source.priority > highest.source.priority ? candidate : highest
  )

  return { field: conflict.field, resolvedValue: winner.value, resolvedFrom: winner.source }
}

// Orders Component Recipes so composeRenderRecipe merges/resolves
// conflicts in a deterministic, priority-ascending sequence.
export function sortRecipePriority(entries: RenderRecipeEntry[]): RenderRecipeEntry[] {
  return [...entries].sort((a, b) => a.priority - b.priority)
}

// One field (e.g. `camera`) across every sorted entry: keys that only one
// entry sets are copied straight through; keys two or more entries set
// with the SAME value are not a real conflict either; only a genuine
// differing-value collision goes through resolveRecipeConflict. Real
// RenderRecipeEntry sources are available here (unlike a pairwise fold),
// so every RecipeConflictCandidate can cite its actual contributor.
function mergeRecordField(field: RecipeRecordField, sortedEntries: RenderRecipeEntry[]): Record<string, unknown> {
  const contributions = new Map<string, RecipeConflictCandidate[]>()

  sortedEntries.forEach((entry) => {
    Object.entries(entry.recipe[field]).forEach(([key, value]) => {
      const list = contributions.get(key) ?? []
      list.push({ value, source: entry })
      contributions.set(key, list)
    })
  })

  const merged: Record<string, unknown> = {}

  contributions.forEach((candidates, key) => {
    const distinctValues = new Set(candidates.map((candidate) => JSON.stringify(candidate.value)))

    if (distinctValues.size <= 1) {
      merged[key] = candidates[candidates.length - 1].value
      return
    }

    merged[key] = resolveRecipeConflict({ field, candidates }).resolvedValue
  })

  return merged
}

// Component category with no dedicated Prompt Builder step (Prompt
// Architecture Realignment, 2026-08-06) — its resolved Component Rules fold
// into `garmentLayoutRules` instead of a per-category slot in
// `componentRulesByCategory` (see aiDna/types.ts's
// LOOK_CUTTING_FIT_COMPONENT_RULES doc comment for why).
const NO_DEDICATED_STEP_CATEGORIES: MasterDataCategory[] = ['look_cutting']

// Reads Component Recipe (RenderRecipeEntry[]) + Global Render Policy ->
// normalizes -> validates -> sorts by priority -> merges + resolves
// conflicts per field -> produces one Master Render Recipe. Returns null
// when there's nothing to compose (no entries) or the input fails
// structural validation — same "null means not ready" convention as
// buildRenderRecipe/buildRenderInstruction elsewhere in this pipeline.
export function composeRenderRecipe(input: ComposeRenderRecipeInput): MasterRenderRecipe | null {
  const { entries, policy } = input

  if (entries.length === 0) {
    return null
  }

  const normalized = normalizeRenderRecipeEntries(entries)
  const validation = validateRenderRecipeEntries(normalized)

  if (!validation.valid) {
    return null
  }

  const sorted = sortRecipePriority(normalized)

  const sources: RecipeSource[] = sorted.map((entry) => ({
    itemId: entry.itemId,
    category: entry.category,
    priority: entry.priority,
  }))

  // Component Default Knowledge + Component Delta Knowledge merge — one
  // category-level baseline (Front Placket, Collar, ...), each entry's own
  // recipe.componentRules as ITS Delta Knowledge on top. Every category's
  // Component Default Knowledge is empty today (componentDefaultKnowledge/
  // registry.ts) except `identity`, so in practice this passes each entry's
  // own componentRules through unchanged — but the merge point is real and
  // ready for whenever a category default is populated.
  const resolvedComponentKnowledge = sorted.map((entry) =>
    resolveComponentKnowledge(entry.category, {
      referenceInstruction: null,
      componentRules: entry.recipe.componentRules ?? [],
      identity: {},
    })
  )

  // Prompt Architecture Realignment (2026-08-06) — componentRulesByCategory
  // replaces the old flat, everything-unioned negativeRules/lockRules pool.
  // Each selected component's OWN resolved Component Rules stay attributed
  // to that component's own category, read by Prompt Builder at that
  // component's own step (Collar/Placket/Pocket/Cuff/Material/...) — never
  // pooled with another component's or with the Engine's own
  // garmentLayoutRules/finalConstraintRules.
  const componentRulesByCategory: Partial<Record<MasterDataCategory, string[]>> = {}
  let lookCuttingComponentRules: string[] = []
  sorted.forEach((entry, index) => {
    const rules = resolvedComponentKnowledge[index].componentRules
    if (rules.length === 0) return
    if (NO_DEDICATED_STEP_CATEGORIES.includes(entry.category)) {
      lookCuttingComponentRules = rules
      return
    }
    componentRulesByCategory[entry.category] = rules
  })

  // Engine-only now — no per-item contribution (Delta Knowledge decision,
  // 2026-08-04, unchanged in spirit by this rename). Look Cutting's own
  // Component Rules (no dedicated step) are the one addition to
  // garmentLayoutRules beyond the Engine default, since Garment Layout is
  // where a fit/silhouette delta belongs when it has nowhere else to go.
  const garmentLayoutRules = Array.from(new Set([...policy.garmentLayoutRules, ...lookCuttingComponentRules]))
  const finalConstraintRules = [...policy.finalConstraintRules]

  // Component Identity Knowledge (2026-08-04) — every variant in a category
  // inherits that category's identity facts (e.g. every Front Placket
  // variant gets Length/Width/Position/Construction) without needing its own
  // copy anywhere. Namespaced under the category key so two categories can
  // never collide on the same fact name inside the shared `garment` bag.
  const componentIdentity: Record<string, unknown> = {}
  sorted.forEach((entry, index) => {
    const identity = resolvedComponentKnowledge[index].identity
    if (Object.keys(identity).length > 0) {
      componentIdentity[entry.category] = identity
    }
  })

  // GlobalRenderPolicy overlaps RenderRecipe on 5 fields (camera, pose,
  // lighting, composition, visibilityRules) — policy supplies the baseline
  // there and any item's own Render Recipe overrides it key-by-key, since a
  // specific Component Recipe is more authoritative than the global
  // default. Focus/fabricBehavior/garment/fabricIdentity/stitching/
  // embroidery still have no policy equivalent (not on GlobalRenderPolicy
  // at all), so they come only from entries. Background/quality/style have
  // no RenderRecipe equivalent, so they come only from policy.
  return {
    camera: { ...normalizeRecord(policy.camera), ...mergeRecordField('camera', sorted) },
    pose: { ...normalizeRecord(policy.pose), ...mergeRecordField('pose', sorted) },
    lighting: { ...normalizeRecord(policy.lighting), ...mergeRecordField('lighting', sorted) },
    composition: { ...normalizeRecord(policy.composition), ...mergeRecordField('composition', sorted) },
    focus: mergeRecordField('focus', sorted),
    fabricBehavior: mergeRecordField('fabricBehavior', sorted),
    visibilityRules: { ...normalizeRecord(policy.visibilityRules), ...mergeRecordField('visibilityRules', sorted) },
    garment: { ...mergeRecordField('garment', sorted), ...componentIdentity },
    fabricIdentity: mergeRecordField('fabricIdentity', sorted),
    stitching: mergeRecordField('stitching', sorted),
    embroidery: mergeRecordField('embroidery', sorted),
    background: normalizeRecord(policy.background),
    quality: normalizeRecord(policy.quality),
    style: normalizeRecord(policy.style),
    garmentLayoutRules,
    finalConstraintRules,
    componentRulesByCategory,
    sources,
    composedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Debug/trace only — everything below is purely additive and never called by
// composeRenderRecipe or any production caller. It exists so an audit tool
// can show, per field per key, which Master Item's value won and which
// Master Items' values were overridden — composeRenderRecipe itself
// deliberately never persists this (mergeRecordField's per-key
// `resolvedFrom` is real, computed, and thrown away, by design). Recomputes
// the same normalize -> validate -> sort -> per-field merge steps as
// composeRenderRecipe so the trace is guaranteed to describe the exact same
// result, not an approximation of it.

export interface RecipeFieldKeyTrace {
  key: string
  value: unknown
  resolvedFrom: RecipeSource | null
  overriddenBy: RecipeSource | null
  overriddenSources: RecipeSource[]
}

export type RecipeComposerTrace = Record<RecipeRecordField, RecipeFieldKeyTrace[]>

function toRecipeSource(entry: RenderRecipeEntry): RecipeSource {
  return { itemId: entry.itemId, category: entry.category, priority: entry.priority }
}

function traceRecordField(field: RecipeRecordField, sortedEntries: RenderRecipeEntry[]): RecipeFieldKeyTrace[] {
  const contributions = new Map<string, RecipeConflictCandidate[]>()

  sortedEntries.forEach((entry) => {
    Object.entries(entry.recipe[field]).forEach(([key, value]) => {
      const list = contributions.get(key) ?? []
      list.push({ value, source: entry })
      contributions.set(key, list)
    })
  })

  const trace: RecipeFieldKeyTrace[] = []

  contributions.forEach((candidates, key) => {
    const distinctValues = new Set(candidates.map((candidate) => JSON.stringify(candidate.value)))

    if (distinctValues.size <= 1) {
      const winner = candidates[candidates.length - 1]
      trace.push({ key, value: winner.value, resolvedFrom: toRecipeSource(winner.source), overriddenBy: null, overriddenSources: [] })
      return
    }

    const resolution = resolveRecipeConflict({ field, candidates })
    const overriddenSources = candidates
      .filter((candidate) => candidate.source !== resolution.resolvedFrom)
      .map((candidate) => toRecipeSource(candidate.source))

    trace.push({
      key,
      value: resolution.resolvedValue,
      resolvedFrom: resolution.resolvedFrom ? toRecipeSource(resolution.resolvedFrom) : null,
      overriddenBy: resolution.resolvedFrom ? toRecipeSource(resolution.resolvedFrom) : null,
      overriddenSources,
    })
  })

  return trace
}

// Same input contract as composeRenderRecipe; returns null under the exact
// same "nothing to compose" conditions. Only the 11 Component-Recipe fields
// are traced (background/quality/style come from GlobalRenderPolicy only,
// never a per-item collision, so there is nothing to trace there).
export function composeRenderRecipeTrace(input: ComposeRenderRecipeInput): RecipeComposerTrace | null {
  const { entries } = input

  if (entries.length === 0) {
    return null
  }

  const normalized = normalizeRenderRecipeEntries(entries)
  const validation = validateRenderRecipeEntries(normalized)

  if (!validation.valid) {
    return null
  }

  const sorted = sortRecipePriority(normalized)

  const trace = {} as RecipeComposerTrace
  RECIPE_RECORD_FIELDS.forEach((field) => {
    trace[field] = traceRecordField(field, sorted)
  })

  // Component Identity Knowledge — mirrors composeRenderRecipe's own
  // post-merge injection (see that function's own comment) so this trace
  // stays a faithful account of the real composed output, not an
  // approximation of it.
  sorted.forEach((entry) => {
    const identity = resolveComponentKnowledge(entry.category, {
      referenceInstruction: null,
      componentRules: [],
      identity: {},
    }).identity
    if (Object.keys(identity).length > 0) {
      trace.garment.push({
        key: entry.category,
        value: identity,
        resolvedFrom: toRecipeSource(entry),
        overriddenBy: null,
        overriddenSources: [],
      })
    }
  })

  return trace
}
