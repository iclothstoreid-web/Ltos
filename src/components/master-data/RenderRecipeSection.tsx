'use client'

import { RENDER_RECIPE_STATUS_LABELS } from '@/lib/design/renderRecipe/types'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'

interface RenderRecipeSectionProps {
  recipe: RenderRecipe
}

// Placeholder only, per this sprint's brief ("Belum perlu Editor. Belum
// perlu Form. Cukup placeholder.") — just Status/Version. Render Recipe
// itself (camera/pose/lighting/composition/focus/fabricBehavior/
// visibilityRules/renderPriority/negativeRules) has no editor yet; it's
// created empty and stays that way until a later sprint builds one.
export function RenderRecipeSection({ recipe }: RenderRecipeSectionProps) {
  return (
    <div className="border-t border-[#c4c7c7]/30 pt-5 mt-2">
      <p className="font-sans text-[10px] uppercase tracking-widest text-[#775a19] mb-3">Render Recipe</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1">Status</p>
          <p className="font-sans text-sm text-[#151c27]">{RENDER_RECIPE_STATUS_LABELS[recipe.status]}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1">Version</p>
          <p className="font-sans text-sm text-[#151c27]">{recipe.version}</p>
        </div>
      </div>
    </div>
  )
}
