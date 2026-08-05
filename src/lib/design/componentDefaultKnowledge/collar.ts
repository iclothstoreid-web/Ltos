import type { RenderRecipeEntry } from '@/lib/design/recipeComposer/types'
import { EMPTY_COMPONENT_DEFAULT_KNOWLEDGE, type ComponentDefaultKnowledge } from './types'

// Collar ('kerah') Component Default Knowledge (locked brief, 2026-08-05) —
// the one category with TWO construction-dependent defaults instead of a
// single fixed one (see registry.ts's own comment on why `kerah` stays
// unpopulated there). Selection is driven exclusively by each Kerah item's
// own `construction_type` column (design_master_options, migration
// 20260826000002) — never by catalog name, never hardcoded per component,
// per the locked brief ("Jangan menggunakan pencocokan berdasarkan nama
// katalog. Jangan menggunakan hardcode nama component.").
export type CollarConstructionType = 'one_piece' | 'two_piece'

export const COLLAR_DEFAULT_1: ComponentDefaultKnowledge = {
  ...EMPTY_COMPONENT_DEFAULT_KNOWLEDGE,
  identity: {
    type: 'One-piece Collar',
    construction: 'One-piece standing collar.',
    position: 'Neck opening.',
  },
}

export const COLLAR_DEFAULT_2: ComponentDefaultKnowledge = {
  ...EMPTY_COMPONENT_DEFAULT_KNOWLEDGE,
  identity: {
    type: 'Two-piece Shirt Collar',
    construction: 'Separate collar stand and collar leaf.',
    position: 'Neck opening.',
  },
}

// No construction_type set yet -> EMPTY, same "nothing configured" fallback
// every other Component Default Knowledge slot uses (registry.ts's
// getComponentDefaultKnowledge) — never a guessed default between the two.
export function getCollarDefaultKnowledge(
  constructionType: CollarConstructionType | null | undefined
): ComponentDefaultKnowledge {
  if (constructionType === 'one_piece') return COLLAR_DEFAULT_1
  if (constructionType === 'two_piece') return COLLAR_DEFAULT_2
  return EMPTY_COMPONENT_DEFAULT_KNOWLEDGE
}

// Injects the selected Collar default's identity into the 'kerah' entry's
// own `recipe.garment.kerah` — the exact same namespaced-key shape Recipe
// Composer's own Component Identity Knowledge step already writes for every
// other category (composer.ts's `componentIdentity[entry.category]`, see
// that file's comment). Recipe Composer is locked (never modified this
// sprint) and only ever calls resolveComponentKnowledge(entry.category, ...)
// with a category-only lookup — it has no way to know one Kerah item's
// construction_type apart from another's. Running this BEFORE entries reach
// Recipe Composer keeps Composer itself untouched: for 'kerah', its own
// resolveComponentKnowledge('kerah', ...) call still resolves an EMPTY
// category default (registry.ts), so its componentIdentity spread never
// sets a `kerah` key and can never clobber what this function already wrote
// into recipe.garment.kerah — same "more specific source wins, no
// collision" property every other pre-Composer augmentation in
// app/api/design/render/route.ts already relies on (e.g. the warna_bahan /
// dna_colors merge).
export function applyCollarComponentIdentity(
  entries: RenderRecipeEntry[],
  constructionTypeByItemId: Map<string, CollarConstructionType | null>
): RenderRecipeEntry[] {
  return entries.map((entry) => {
    if (entry.category !== 'kerah') return entry

    const identity = getCollarDefaultKnowledge(constructionTypeByItemId.get(entry.itemId) ?? null).identity
    if (Object.keys(identity).length === 0) return entry

    return {
      ...entry,
      recipe: {
        ...entry.recipe,
        garment: { ...entry.recipe.garment, kerah: identity },
      },
    }
  })
}
