import type { AiDesignDna } from '@/lib/design/aiDna/types'
import type { MasterDataCategory } from '@/lib/design/masterData'

// DNA Validator (Sprint AI-R2.5, Part 4) — deterministic, no AI. Runs
// per-component, BEFORE Recipe Composer, over a Master Item's real AI
// Design DNA (design_master_options.ai_dna — see aiDna/types.ts). If a
// required field is missing, `valid` is false and the caller should cancel
// the render for that scenario ("Render dibatalkan" per the brief).
//
// Reference-First Cleanup — AI Design DNA's old 6 freeform top-level fields
// (geometry/construction/appearance/materials/stitching/placement) are down
// to 2: `referenceInstruction` (the one admin-editable text every category
// now carries) and `placement` (kept, structural). The old per-category
// required-field table and the illustrative Length/Sleeve/Silhouette/
// Construction/Collar sub-key check (which inspected `geometry`/
// `construction` as nested objects) have no target left to check — deleted,
// not migrated. Every category now requires the same one thing: non-empty
// `referenceInstruction`.

export const DNA_REQUIRED_FIELDS_BY_CATEGORY: Record<MasterDataCategory, readonly string[]> = {
  model_thobe: ['referenceInstruction'],
  look_cutting: ['referenceInstruction'],
  kerah: ['referenceInstruction'],
  manset: ['referenceInstruction'],
  plaket: ['referenceInstruction'],
  saku: ['referenceInstruction'],
  bahan: ['referenceInstruction'],
  warna_bahan: ['referenceInstruction'],
  aksesori: ['referenceInstruction'],
  bordir: ['referenceInstruction'],
  handmade_zigzag: ['referenceInstruction'],
  // Design Look has no AI Design DNA workflow (it is a preset, not a render
  // component) — this entry only keeps the Record total.
  design_look: ['referenceInstruction'],
}

export interface DnaValidatorResult {
  itemId: string
  category: MasterDataCategory
  valid: boolean
  requiredFields: readonly string[]
  missingFields: string[]
  errors: string[]
}

export function validateComponentDna(params: {
  itemId: string
  category: MasterDataCategory
  aiDna: AiDesignDna
}): DnaValidatorResult {
  const { itemId, category, aiDna } = params
  const requiredFields = DNA_REQUIRED_FIELDS_BY_CATEGORY[category] ?? []
  const errors: string[] = []

  if (aiDna.status === 'pending') {
    errors.push(`AI Design DNA masih "pending" — belum ada data sama sekali.`)
  }

  const missingFields = requiredFields.filter((field) => {
    const value = aiDna[field as keyof AiDesignDna]
    return value === null || value === undefined || value === ''
  })
  missingFields.forEach((field) => errors.push(`Field "${field}" kosong (null).`))

  return {
    itemId,
    category,
    valid: errors.length === 0,
    requiredFields,
    missingFields,
    errors,
  }
}
