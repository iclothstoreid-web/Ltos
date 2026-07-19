import type { GlobalRenderPolicy, MasterRenderRecipe, RenderRecipeEntry } from './types'

// Interface only — per this sprint's brief, no merge logic, no
// conflict-resolution algorithm, no AI. A later sprint (Prompt Builder
// Foundation) will fill composeRenderRecipe's body in; Prompt Builder
// itself must never call mergeRecipe/resolveRecipeConflict/
// sortRecipePriority directly — this module is the only place allowed to
// combine Recipes.

export interface ComposeRenderRecipeInput {
  entries: RenderRecipeEntry[]
  policy: GlobalRenderPolicy
}

// Reads Render Recipe -> Priority -> Global Render Policy and will
// eventually produce one Master Render Recipe (never persisted — see
// types.ts). No implementation this sprint.
export function composeRenderRecipe(_input: ComposeRenderRecipeInput): MasterRenderRecipe | null {
  return null
}

export interface MergeRecipeInput {
  base: Partial<MasterRenderRecipe>
  incoming: RenderRecipeEntry
}

// Building block composeRenderRecipe will eventually call once per sorted
// entry to fold one more Render Recipe into the accumulating Master Render
// Recipe. No merge logic implemented this sprint — returns `base` as-is.
export function mergeRecipe(input: MergeRecipeInput): Partial<MasterRenderRecipe> {
  return input.base
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

// Will eventually decide which source wins when two or more Render Recipes
// set the same field. No conflict-resolution algorithm implemented this
// sprint.
export function resolveRecipeConflict(conflict: RecipeConflict): RecipeConflictResolution {
  return { field: conflict.field, resolvedValue: null, resolvedFrom: null }
}

// Will eventually order RenderRecipeEntry[] by priority before
// composeRenderRecipe merges them. No sort logic implemented this sprint —
// returns the input order unchanged.
export function sortRecipePriority(entries: RenderRecipeEntry[]): RenderRecipeEntry[] {
  return entries
}
