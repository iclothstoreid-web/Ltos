import { MASTER_DATA_CATEGORIES, type MasterDataCategory } from '@/lib/design/masterData'
import { EMPTY_COMPONENT_DEFAULT_KNOWLEDGE, type ComponentDefaultKnowledge } from './types'

// One Component Default Knowledge slot per category (Model Thobe, Look
// Cutting, Kerah/Collar, Manset/Cuff, Plaket/Front Placket, Saku/Chest
// Pocket, Bahan, Warna Bahan, Aksesori, Bordir, Handmade Zig-Zag) — every
// category gets a slot up front so a future sprint can populate any of them
// without touching this module's shape again.
//
// Front Placket ('plaket') Component Identity Knowledge (2026-08-04) — the
// first category populated: structural geometry/construction facts every
// Front Placket variant inherits (Asil/Badr/Fakhr/Sudas Plaket and any
// future variant, e.g. Hexagon, which stores only its own delta on top of
// this). Deliberately identity-only — no Hero Image, no referenceInstruction,
// no componentRules, per the locked brief. Every other
// category's slot stays EMPTY_COMPONENT_DEFAULT_KNOWLEDGE — no content
// seeded ("Jangan mengisi data default apa pun" beyond what was explicitly
// requested for this one category).
export const COMPONENT_DEFAULT_KNOWLEDGE: Record<MasterDataCategory, ComponentDefaultKnowledge> =
  MASTER_DATA_CATEGORIES.reduce((acc, category) => {
    acc[category] = EMPTY_COMPONENT_DEFAULT_KNOWLEDGE
    return acc
  }, {} as Record<MasterDataCategory, ComponentDefaultKnowledge>)

COMPONENT_DEFAULT_KNOWLEDGE.plaket = {
  ...EMPTY_COMPONENT_DEFAULT_KNOWLEDGE,
  identity: {
    length: '40 cm',
    width: '6 cm',
    position: 'Center Front',
    construction: 'Vertical front placket extending from the collar to the upper abdomen.',
  },
}

// Cuff ('manset'), Pocket ('saku'), Material ('bahan') Component Default
// Knowledge (locked brief, 2026-08-05) — every variant/item in each category
// inherits this identity unless a future sprint adds its own delta on top,
// same "category baseline" role as Plaket above. `kerah` (Collar) is
// deliberately NOT populated here — Collar has two construction-type-
// dependent defaults (COLLAR_DEFAULT_1/COLLAR_DEFAULT_2), selected by each
// item's own `construction_type` field rather than one fixed category
// default; see componentDefaultKnowledge/collar.ts.
COMPONENT_DEFAULT_KNOWLEDGE.manset = {
  ...EMPTY_COMPONENT_DEFAULT_KNOWLEDGE,
  identity: {
    construction: 'Standard shirt cuff.',
    position: 'Sleeve opening.',
    closure: 'Single overlap cuff.',
    symmetry: 'Left and right cuffs must be symmetrical.',
  },
}

COMPONENT_DEFAULT_KNOWLEDGE.saku = {
  ...EMPTY_COMPONENT_DEFAULT_KNOWLEDGE,
  identity: {
    construction: 'Patch pocket.',
    position: 'Left chest.',
    attachment: 'Topstitched onto garment body.',
    symmetry: 'Pocket opening remains horizontal.',
  },
}

COMPONENT_DEFAULT_KNOWLEDGE.bahan = {
  ...EMPTY_COMPONENT_DEFAULT_KNOWLEDGE,
  identity: {
    surface: 'Fine plain weave.',
    appearance: 'Smooth matte finish.',
    texture: 'Very subtle fabric texture.',
    drape: 'Soft natural drape.',
    pattern: 'Solid without visible pattern.',
  },
}

export function getComponentDefaultKnowledge(category: MasterDataCategory): ComponentDefaultKnowledge {
  return COMPONENT_DEFAULT_KNOWLEDGE[category] ?? EMPTY_COMPONENT_DEFAULT_KNOWLEDGE
}
