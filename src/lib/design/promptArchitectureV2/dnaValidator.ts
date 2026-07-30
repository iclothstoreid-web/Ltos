import type { AiDesignDna } from '@/lib/design/aiDna/types'
import type { MasterDataCategory } from '@/lib/design/masterData'

// DNA Validator (Sprint AI-R2.5, Part 4) — deterministic, no AI. Runs
// per-component, BEFORE Recipe Composer, over a Master Item's real AI
// Design DNA (design_master_options.ai_dna — see aiDna/types.ts). If a
// required field is missing, `valid` is false and the caller should cancel
// the render for that scenario ("Render dibatalkan" per the brief).
//
// Field taxonomy note (read before editing DNA_REQUIRED_FIELDS_BY_CATEGORY):
// AI Design DNA only has 6 real structured top-level fields today —
// geometry / construction / appearance / materials / stitching / placement
// (aiDna/types.ts) — populated as freeform `unknown` JSON by whatever
// authored that item's DNA. The brief's own example ("Saudi Modern harus
// memiliki Length, Sleeve, Silhouette, Construction, Collar") describes
// SUB-KEYS one level deeper than that — content this codebase has nowhere
// defined a schema for yet (no migration, no seed data, no componentDna/
// blueprint anywhere names those exact keys — confirmed by search). This
// validator does NOT invent that schema (would be "redesign business
// logic"/database). Instead it does two real, honest things:
//   1. Checks the 6 real top-level fields against a per-category required
//      set below (seeded from which fields the DNA Resolver's own
//      AI_DNA_GARMENT_FIELDS mapping actually uses — dnaResolver/
//      resolver.ts — tune this table as real DNA content gets authored).
//   2. ONLY for model_thobe, and ONLY when `geometry`/`construction` happen
//      to already be a plain object (not a string/array/null), additionally
//      checks for the brief's illustrative Length/Sleeve/Silhouette/
//      Construction/Collar sub-keys — reported as `applicable: false` with
//      a clear reason when the data isn't structured enough to check, never
//      silently assumed present.

export const DNA_REQUIRED_FIELDS_BY_CATEGORY: Record<MasterDataCategory, readonly string[]> = {
  // The Anchor (recipeComposer/composer.ts's resolveRecipeConflict) — the
  // one component whose garment identity must never be incomplete.
  model_thobe: ['geometry', 'construction', 'appearance', 'materials', 'stitching', 'placement'],
  look_cutting: ['geometry', 'construction'],
  kerah: ['geometry', 'construction'],
  manset: ['geometry', 'construction'],
  plaket: ['geometry', 'construction'],
  saku: ['geometry', 'construction'],
  bahan: ['appearance', 'materials'],
  warna_bahan: ['appearance'],
  aksesori: ['geometry', 'appearance'],
  bordir: ['appearance', 'placement'],
  handmade_zigzag: ['appearance', 'placement'],
}

// Illustrative only (brief's own "Saudi Modern" example) — applied as a
// best-effort deeper check, never as a source of truth for what geometry
// "should" contain.
const MODEL_THOBE_GEOMETRY_SUB_KEYS = ['length', 'sleeve', 'silhouette', 'construction', 'collar'] as const

export interface DnaSubKeyCheck {
  checkedOn: 'geometry' | 'construction'
  applicable: boolean
  requiredKeys: readonly string[]
  missingKeys: string[]
  reason: string
}

export interface DnaValidatorResult {
  itemId: string
  category: MasterDataCategory
  valid: boolean
  requiredFields: readonly string[]
  missingFields: string[]
  subKeyCheck: DnaSubKeyCheck | null
  errors: string[]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function checkModelThobeSubKeys(aiDna: AiDesignDna): DnaSubKeyCheck | null {
  const source: 'geometry' | 'construction' = isPlainObject(aiDna.geometry) ? 'geometry' : 'construction'
  const value = aiDna[source]

  if (!isPlainObject(value)) {
    return {
      checkedOn: source,
      applicable: false,
      requiredKeys: MODEL_THOBE_GEOMETRY_SUB_KEYS,
      missingKeys: [],
      reason: `${source} bukan object terstruktur (freeform/kosong) — sub-key Length/Sleeve/Silhouette/Construction/Collar tidak bisa dicek.`,
    }
  }

  const presentKeysLower = new Set(Object.keys(value).map((key) => key.toLowerCase()))
  const missingKeys = MODEL_THOBE_GEOMETRY_SUB_KEYS.filter((key) => !presentKeysLower.has(key))

  return {
    checkedOn: source,
    applicable: true,
    requiredKeys: MODEL_THOBE_GEOMETRY_SUB_KEYS,
    missingKeys,
    reason:
      missingKeys.length === 0
        ? `Semua sub-key ada di ${source}.`
        : `${source} tidak memiliki: ${missingKeys.join(', ')}.`,
  }
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
    return value === null || value === undefined
  })
  missingFields.forEach((field) => errors.push(`Field "${field}" kosong (null).`))

  const subKeyCheck = category === 'model_thobe' && aiDna.status !== 'pending' ? checkModelThobeSubKeys(aiDna) : null
  if (subKeyCheck?.applicable && subKeyCheck.missingKeys.length > 0) {
    errors.push(`Sub-key ${subKeyCheck.checkedOn} tidak lengkap: ${subKeyCheck.missingKeys.join(', ')}.`)
  }

  return {
    itemId,
    category,
    valid: errors.length === 0,
    requiredFields,
    missingFields,
    subKeyCheck,
    errors,
  }
}
