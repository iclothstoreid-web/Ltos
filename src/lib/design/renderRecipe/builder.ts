import type { RenderRecipe } from './types'
import type { MasterDataCategory } from '@/lib/design/masterData'

// Interface only — per this sprint's brief, no implementation yet. A later
// sprint (Prompt Builder) fills these bodies in without needing to change
// these shapes. Render Recipe itself never stores a prompt/sentence, only
// structured data (camera/pose/lighting/etc — see types.ts).

export interface BuildRenderRecipeInput {
  itemId: string
  category: MasterDataCategory
}

// Will eventually assemble/normalize a single Master Item's Render Recipe.
// No implementation this sprint.
export function buildRenderRecipe(_input: BuildRenderRecipeInput): RenderRecipe | null {
  return null
}

export interface MergeRenderRecipesInput {
  // Ordered so callers control precedence (e.g. Model, then Collar, then
  // Pocket) once an actual merge strategy exists — see Task 6: Prompt
  // Builder will need to combine several items' recipes (Saudi Classic +
  // Collar C07 + Pocket P03 + ...) into one.
  recipes: RenderRecipe[]
}

// Will eventually combine multiple Master Items' Render Recipes into one
// merged RenderRecipe for Prompt Builder to read. No merge strategy
// implemented this sprint.
export function mergeRenderRecipes(_input: MergeRenderRecipesInput): RenderRecipe | null {
  return null
}

export interface RenderRecipeValidation {
  valid: boolean
  errors: string[]
}

// Will eventually check a RenderRecipe is structurally sound (e.g. required
// fields present) before Prompt Builder reads it. No rules implemented this
// sprint.
export function validateRenderRecipe(_recipe: RenderRecipe): RenderRecipeValidation {
  return { valid: true, errors: [] }
}
