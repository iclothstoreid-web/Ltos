import { resolveComponentKnowledge } from '@/lib/design/componentDefaultKnowledge/resolver'
import type { GlobalRenderPolicy, MasterRenderRecipe, RecipeSource, RenderRecipeEntry } from './types'

// Recipe Composer Foundation (Sprint AI-05) — real normalize/validate/
// merge/resolve-conflict logic, still no DNA, no Vision, no UI, no
// Storage, no OpenAI. Prompt Builder itself must never call
// mergeRecipe/resolveRecipeConflict/sortRecipePriority directly — this
// module is the only place allowed to combine Recipes.

export interface ComposeRenderRecipeInput {
  entries: RenderRecipeEntry[]
  policy: GlobalRenderPolicy
}

// The 11 fields RenderRecipe and MasterRenderRecipe both have — the only
// ones a Component Recipe can actually contribute to. `background`/
// `quality`/`style` exist only on GlobalRenderPolicy (applied once, not
// per-item — see composeRenderRecipe) and are deliberately excluded here.
// `garment`/`fabricIdentity`/`stitching`/`embroidery` are Component-DNA
// producers (Sprint AI-07) — empty until a future sprint populates them,
// merged here with the exact same algorithm as the original 7 fields.
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
      negativeRules: Array.isArray(entry.recipe.negativeRules) ? entry.recipe.negativeRules : [],
      lockRules: Array.isArray(entry.recipe.lockRules) ? entry.recipe.lockRules : [],
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
// (e.g. Collar/Cuff/Pocket, since Model Thobe is always sent first at
// priority 0) silently clobber Model Thobe's own referenceInstruction —
// the one component that defines the garment's actual identity. Model
// Thobe is the Anchor: on `garment` only, if Model Thobe is among the
// candidates it always wins the collision, regardless of priority. Every
// other field (camera, lighting, ...) keeps the original priority-wins
// rule unchanged.
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

export interface MergeRecipeInput {
  base: Partial<MasterRenderRecipe>
  incoming: RenderRecipeEntry
}

// Standalone two-way primitive: folds one more Component Recipe's 7 shared
// fields into an existing accumulator, last-wins per key. Kept for simple
// pairwise use; composeRenderRecipe itself merges the *whole* sorted batch
// via mergeRecordField above, since 3+ entries commonly contribute to one
// field and a real RecipeConflict needs every contributor, not just the
// two sides of one fold step.
export function mergeRecipe(input: MergeRecipeInput): Partial<MasterRenderRecipe> {
  const { base, incoming } = input
  const merged: Partial<MasterRenderRecipe> = { ...base }

  RECIPE_RECORD_FIELDS.forEach((field) => {
    merged[field] = {
      ...normalizeRecord(base[field]),
      ...incoming.recipe[field],
    }
  })

  merged.negativeRules = Array.from(new Set([...(base.negativeRules ?? []), ...incoming.recipe.negativeRules]))
  merged.lockRules = Array.from(new Set([...(base.lockRules ?? []), ...incoming.recipe.lockRules]))

  return merged
}

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

  // Engine Default Policy (Delta Knowledge decision, 2026-08-04; Render
  // Engine Knowledge Refactor, same day) — Identity Knowledge's rule set
  // used to be copied into every row's own ai_dna.lockRules/negativeRules
  // (the repository audit that motivated the Delta Knowledge decision found
  // 94.6%/89.0% of all loaded rule text was that exact duplicate).
  // Repository rows now store Delta Knowledge only (empty unless a
  // component has a genuine override); `policy.lockRules`/`policy.
  // negativeRules` (DEFAULT_GLOBAL_RENDER_POLICY, recipeComposer/types.ts)
  // is the Engine's ONE default source — Global Render Policy
  // (renderEngine/globalRenderPolicy.ts) is what actually populates it. A
  // second, separate Engine-default array used to exist here too
  // (aiDna/types.ts's DEFAULT_LOCK_RULES/DEFAULT_NEGATIVE_RULES) — retired
  // by the Render Engine Knowledge Refactor specifically because two
  // Engine-level sources both merging unconditionally into every render is
  // the same "hides a duplicate the Set silently absorbs" problem the
  // Delta Knowledge decision fixed for per-item rows; `Set` dedup below is
  // unchanged, but now dedupes against only ONE Engine source, not two.
  //
  // Component Default Knowledge layer (infrastructure sprint, 2026-08-04) —
  // one level more specific than the Engine's global policy above: a
  // per-CATEGORY baseline (Front Placket, Collar, ...) every variant in
  // that category inherits, with each entry's own recipe.lockRules/
  // negativeRules as ITS Delta Knowledge on top (Front Placket -> Hexagon
  // stores only what's specific to Hexagon). Every category's Component
  // Default Knowledge is empty this sprint (see componentDefaultKnowledge/
  // registry.ts) — resolveComponentKnowledge still runs per entry so the
  // merge path is real and ready, but with an empty base it is a no-op:
  // `entry.recipe.lockRules` passes through unchanged, same as before this
  // layer existed.
  const resolvedComponentKnowledge = sorted.map((entry) =>
    resolveComponentKnowledge(entry.category, {
      referenceInstruction: null,
      lockRules: entry.recipe.lockRules,
      negativeRules: entry.recipe.negativeRules,
      identity: {},
    })
  )

  const negativeRules = Array.from(
    new Set([...policy.negativeRules, ...resolvedComponentKnowledge.flatMap((knowledge) => knowledge.negativeRules)])
  )
  const lockRules = Array.from(
    new Set([...policy.lockRules, ...resolvedComponentKnowledge.flatMap((knowledge) => knowledge.lockRules)])
  )

  // Component Identity Knowledge (2026-08-04) — every variant in a category
  // inherits that category's identity facts (e.g. every Front Placket
  // variant gets Length/Width/Position/Construction) without needing its own
  // copy anywhere. Namespaced under the category key so two categories can
  // never collide on the same fact name inside the shared `garment` bag
  // (mergeRecordField below resolves same-key collisions to ONE winning
  // value, which would silently drop one category's identity entirely if
  // two categories both wrote to, say, a flat `length` key — namespacing
  // avoids that by construction). Applied after mergeRecordField, not
  // through it, so it can never be dropped by garment's own priority/Anchor
  // collision rule (see resolveRecipeConflict) — identity always survives.
  const componentIdentity: Record<string, unknown> = {}
  sorted.forEach((entry, index) => {
    const identity = resolvedComponentKnowledge[index].identity
    if (Object.keys(identity).length > 0) {
      componentIdentity[entry.category] = identity
    }
  })

  // GlobalRenderPolicy overlaps RenderRecipe on 5 fields now (camera, pose,
  // lighting, composition, visibilityRules — extended from 3 to 5 by the
  // Render Engine Knowledge Refactor's review revision, 2026-08-04, so
  // Global Render Recipe's Composition/Visibility content has a field to
  // reach: see recipeComposer/types.ts's GlobalRenderPolicy interface) —
  // policy supplies the baseline there and any item's own Render Recipe
  // overrides it key-by-key, since a specific Component Recipe is more
  // authoritative than the global default. Same merge shape as camera/
  // pose/lighting always used, nothing new invented. Focus/fabricBehavior/
  // garment/fabricIdentity/stitching/embroidery still have no policy
  // equivalent (not on GlobalRenderPolicy at all), so they come only from
  // entries. Background/quality/style have no RenderRecipe equivalent, so
  // they come only from policy.
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
    negativeRules,
    lockRules,
    sources,
    composedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Debug/trace only (Sprint AI-R1) — everything below is purely additive and
// never called by composeRenderRecipe or any production caller. It exists so
// an audit tool can show, per field per key, which Master Item's value won
// and which Master Items' values were overridden — composeRenderRecipe
// itself deliberately never persists this (mergeRecordField's per-key
// `resolvedFrom` is real, computed, and thrown away, by design — see
// mergeRecordField's own doc comment above). Recomputes the same
// normalize -> validate -> sort -> per-field merge steps as
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

  // Component Identity Knowledge (2026-08-04) — mirrors composeRenderRecipe's
  // own post-merge injection (see that function's own comment) so this trace
  // stays a faithful account of the real composed output, not an
  // approximation of it. `resolvedFrom` points at the entry whose category
  // this identity belongs to — it is synthesized from Component Default
  // Knowledge, not read off that entry's own recipe.garment, but attributing
  // it to that entry is the accurate "why is this here" answer for the
  // debug viewer.
  sorted.forEach((entry) => {
    const identity = resolveComponentKnowledge(entry.category, {
      referenceInstruction: null,
      lockRules: [],
      negativeRules: [],
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
