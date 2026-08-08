import type { AiDesignDna } from '@/lib/design/aiDna/types'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'
import type { DNAResolverInput, DNAResolverOutput } from './types'
import { resolveComponentRules } from './resolveComponentRules'

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

// Reference-First Cleanup — AI Design DNA now contributes exactly two things
// to `garment`: `referenceInstruction` (the one admin-editable text field
// that replaced the old 5-field narrative prose) and `placement` (kept
// as-is — structural positioning a photo can't convey). Any key the item's
// own Render Recipe.garment already carries wins over the DNA-derived
// value — same "more specific source wins" precedent as
// recipeComposer/composer.ts's mergeRecordField, here applied to two
// sources on the same item rather than across items.
// Color DNA fallback (Sprint PR-01, P4, still relevant post-cleanup) — a
// `warna_bahan` item's real color description may still be authored
// directly into the jsonb `ai_dna` column under legacy ad-hoc keys
// (`description`, `tone`, `undertone`, `brightness`, `saturation`) on rows
// the data-cleanup migration hasn't backfilled into `referenceInstruction`
// yet. Only used when `referenceInstruction` itself is empty, so an item
// that already has real `referenceInstruction` content is unaffected.
function colorDescriptionFallback(aiDna: AiDesignDna): string | null {
  const raw = aiDna as unknown as Record<string, unknown>
  if (typeof raw.description === 'string' && raw.description.trim()) {
    return raw.description
  }
  const descriptors = [raw.tone, raw.undertone, raw.brightness, raw.saturation].filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  )
  return descriptors.length > 0 ? descriptors.join(', ') : null
}

function buildGarmentSpec(
  aiDna: AiDesignDna,
  existingGarment: Record<string, unknown>,
  category: DNAResolverInput['category']
): Record<string, unknown> {
  const derived: Record<string, unknown> = {}

  const referenceText = aiDna.referenceInstruction ?? colorDescriptionFallback(aiDna)

  // Color Identity carve-out (Sprint PR-02, still needed post-cleanup).
  // Recipe Composer's Model Thobe "Anchor" rule (recipeComposer/
  // composer.ts's resolveRecipeConflict) makes Model Thobe always win any
  // same-key collision on `garment` in the diagnostic (merged) path —
  // necessary so a Collar's reference text can never masquerade as the
  // whole garment's shape, but it has the side effect of ALSO discarding
  // warna_bahan's own text (the customer's actual color choice) the moment
  // Model Thobe has its own `referenceInstruction`, since DNA Resolver maps
  // every category onto the same unnamespaced key. Moving color onto its
  // own `color` key removes the collision entirely — Prompt Builder/
  // Serializer/Compression already pass `garment` through generically
  // (Object.entries), so nothing else needs to change.
  if (category === 'warna_bahan') {
    if (referenceText) derived.color = referenceText
  } else if (referenceText) {
    derived.referenceInstruction = referenceText
  }

  if (aiDna.placement !== null && aiDna.placement !== undefined) {
    derived.placement = aiDna.placement
  }

  return { ...derived, ...existingGarment }
}

// Resolves one Master Item's AI Design DNA + Render Recipe into the single
// RenderRecipe a RenderRecipeEntry wraps for Recipe Composer. Render
// Recipe's own structured fields (camera/pose/lighting/etc) pass through
// unchanged — this module never invents render-instruction content, it only
// (a) gates on both sources actually having something to resolve, (b) maps
// AI Design DNA's garment-identity fields into RenderRecipe.garment, and
// (c) unions componentRules from both sources. It never merges across items
// and never resolves a conflict between items — that stays Recipe
// Composer's job.
export function resolveDNA(input: DNAResolverInput): DNAResolverOutput {
  const errors = validate(input)
  if (errors.length > 0) {
    return { recipe: null, ready: false, errors }
  }

  const garment = buildGarmentSpec(input.aiDna, input.renderRecipe.garment, input.category)
  // Safe Migration (2026-08-07) — each source (Render Recipe, AI Design DNA)
  // independently prefers its own `componentRules` when present, falling
  // back to merge(lockRules, negativeRules) otherwise (resolveComponentRules,
  // see that module's own doc comment) — a row that has been migrated on one
  // side but not the other (e.g. ai_dna migrated, render_recipe not yet)
  // still resolves correctly, since each side's fallback is independent.
  // `Set` dedup afterwards is unchanged from before this migration.
  const componentRules = Array.from(
    new Set([...resolveComponentRules(input.renderRecipe), ...resolveComponentRules(input.aiDna)])
  )

  const recipe: RenderRecipe = { ...input.renderRecipe, garment, componentRules }

  return { recipe, ready: true, errors: [] }
}
