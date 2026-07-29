import type { AiDesignDna } from '@/lib/design/aiDna/types'
import type { RenderRecipeEntry } from '@/lib/design/recipeComposer/types'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'
import type { DNAResolverInput, DNAResolverOutput } from './types'

// AI Design DNA's own content fields (see aiDna/types.ts) — everything here
// describes the garment ITSELF, which is exactly what RenderRecipe.garment
// exists to carry (see renderRecipe/types.ts's "Producers for what Component
// DNA... will eventually describe about the item itself" comment). `status`,
// `version`, `metadata` are lifecycle bookkeeping, not garment content, so
// they never get copied into garment.
const AI_DNA_GARMENT_FIELDS = ['geometry', 'construction', 'appearance', 'materials', 'stitching', 'placement'] as const

// Only a non-`pending`/non-`empty` item has anything real to resolve — a
// still-`pending` AI Design DNA or still-`empty` Render Recipe means nothing
// upstream has generated/authored content yet, so there is nothing for this
// module to translate (same "report incompleteness, never invent it"
// convention as validateRenderRecipeEntries / validateRenderInstruction).
function validate(input: DNAResolverInput): string[] {
  const errors: string[] = []

  if (input.aiDna.status === 'pending') {
    errors.push(`Item "${input.itemId}" — AI Design DNA masih berstatus pending, belum ada data untuk di-resolve.`)
  }
  if (input.renderRecipe.status === 'empty') {
    errors.push(`Item "${input.itemId}" — Render Recipe masih berstatus empty, belum ada data untuk di-resolve.`)
  }

  return errors
}

// AI Design DNA fields are mapped into garment as-is, one sub-key per field;
// null fields (nothing generated for that field yet) are skipped rather than
// written as `null`, so a partially-generated DNA doesn't clobber garment
// with placeholder nulls. Any key the item's own Render Recipe.garment
// already carries wins over the DNA-derived value — same "more specific
// source wins" precedent as recipeComposer/composer.ts's mergeRecipe, here
// applied to two sources on the same item rather than two different items.
function buildGarmentSpec(aiDna: AiDesignDna, existingGarment: Record<string, unknown>): Record<string, unknown> {
  const derived: Record<string, unknown> = {}

  AI_DNA_GARMENT_FIELDS.forEach((field) => {
    const value = aiDna[field]
    if (value !== null && value !== undefined) {
      derived[field] = value
    }
  })

  return { ...derived, ...existingGarment }
}

// Resolves one Master Item's AI Design DNA + Render Recipe into the single
// RenderRecipe a RenderRecipeEntry wraps for Recipe Composer. Render
// Recipe's own structured fields (camera/pose/lighting/etc) pass through
// unchanged — this module never invents render-instruction content, it only
// (a) gates on both sources actually having something to resolve, (b) maps
// AI Design DNA's garment-identity fields into RenderRecipe.garment, and
// (c) unions negativeRules from both sources. It never merges across items
// and never resolves a conflict between items — that stays Recipe
// Composer's job.
export function resolveDNA(input: DNAResolverInput): DNAResolverOutput {
  const errors = validate(input)
  if (errors.length > 0) {
    return { recipe: null, ready: false, errors }
  }

  const garment = buildGarmentSpec(input.aiDna, input.renderRecipe.garment)
  // Defensive: some Repository rows (e.g. warna_bahan, saku) were authored
  // with a non-conforming ai_dna/render_recipe shape that omits negativeRules
  // entirely — spreading `undefined` into an array literal throws, unlike the
  // object spread in buildGarmentSpec above. `?? []` only guards against that
  // missing-key case; it changes nothing for any row that already has the
  // array (every currently-passing kerah/manset/plaket/bahan row).
  const negativeRules = Array.from(
    new Set([...(input.renderRecipe.negativeRules ?? []), ...(input.aiDna.negativeRules ?? [])])
  )

  const recipe: RenderRecipe = { ...input.renderRecipe, garment, negativeRules }

  return { recipe, ready: true, errors: [] }
}

// Bridges a resolved item straight into Recipe Composer's own input shape —
// so a future caller can go MasterDataOption[] -> resolveDNA -> this ->
// composeRenderRecipe(...) without Recipe Composer ever needing to know
// AI Design DNA or Render Recipe exist. `priority` stays a caller-supplied
// argument: it is a per-render ordering decision (which item is "more
// specific" for this particular composition), not something a single
// item's own DNA/Recipe can determine on its own.
export function toRenderRecipeEntry(input: DNAResolverInput, priority: number): RenderRecipeEntry | null {
  const { recipe } = resolveDNA(input)
  if (!recipe) return null

  return { itemId: input.itemId, category: input.category, recipe, priority }
}
