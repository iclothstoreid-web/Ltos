import type { AiDesignDna } from '@/lib/design/aiDna/types'
import type { MasterDataCategory } from '@/lib/design/masterData'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'

// DNA Resolver — the missing per-ITEM translation step between AI Design DNA
// + Render Recipe (design_master_options.ai_dna / .render_recipe) and Recipe
// Composer's RenderRecipeEntry input (see recipeComposer/types.ts). Prompt
// Builder's own locked-architecture note (promptBuilder/types.ts) already
// says Recipe Composer never reads AI Design DNA / Render Recipe directly —
// this module is what turns one Master Item's two DB columns into the
// single, self-contained RenderRecipe a RenderRecipeEntry wraps.
//
//   design_master_options (ai_dna, render_recipe)
//     -> DNA Resolver -> RenderRecipe -> Recipe Composer -> ...
//
// DNAResolverInput is always exactly ONE item — this module never merges
// across items and never resolves a cross-item conflict (that stays Recipe
// Composer's exclusive job, per its own locked "only layer allowed to
// combine Render Recipes" rule).

export interface DNAResolverInput {
  itemId: string
  category: MasterDataCategory
  aiDna: AiDesignDna
  renderRecipe: RenderRecipe
}

export interface DNAResolverOutput {
  // null whenever `ready` is false — same "null means not ready" convention
  // as composeRenderRecipe / buildRenderInstruction elsewhere in this
  // pipeline.
  recipe: RenderRecipe | null
  ready: boolean
  errors: string[]
}
