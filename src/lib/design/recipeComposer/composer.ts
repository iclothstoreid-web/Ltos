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
const RECIPE_RECORD_FIELDS = [
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
type RecipeRecordField = (typeof RECIPE_RECORD_FIELDS)[number]

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
export function resolveRecipeConflict(conflict: RecipeConflict): RecipeConflictResolution {
  if (conflict.candidates.length === 0) {
    return { field: conflict.field, resolvedValue: null, resolvedFrom: null }
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

  const negativeRules = Array.from(
    new Set([...policy.negativeRules, ...sorted.flatMap((entry) => entry.recipe.negativeRules)])
  )

  // GlobalRenderPolicy overlaps RenderRecipe on exactly 3 fields (camera,
  // pose, lighting) — policy supplies the baseline there and any item's own
  // Render Recipe overrides it key-by-key, since a specific Component
  // Recipe is more authoritative than the global default. Composition/
  // focus/fabricBehavior/visibilityRules/garment/fabricIdentity/stitching/
  // embroidery have no policy equivalent (not on GlobalRenderPolicy at
  // all), so they come only from entries. Background/quality/style have no
  // RenderRecipe equivalent, so they come only from policy.
  return {
    camera: { ...normalizeRecord(policy.camera), ...mergeRecordField('camera', sorted) },
    pose: { ...normalizeRecord(policy.pose), ...mergeRecordField('pose', sorted) },
    lighting: { ...normalizeRecord(policy.lighting), ...mergeRecordField('lighting', sorted) },
    composition: mergeRecordField('composition', sorted),
    focus: mergeRecordField('focus', sorted),
    fabricBehavior: mergeRecordField('fabricBehavior', sorted),
    visibilityRules: mergeRecordField('visibilityRules', sorted),
    garment: mergeRecordField('garment', sorted),
    fabricIdentity: mergeRecordField('fabricIdentity', sorted),
    stitching: mergeRecordField('stitching', sorted),
    embroidery: mergeRecordField('embroidery', sorted),
    background: normalizeRecord(policy.background),
    quality: normalizeRecord(policy.quality),
    style: normalizeRecord(policy.style),
    negativeRules,
    sources,
    composedAt: new Date().toISOString(),
  }
}
