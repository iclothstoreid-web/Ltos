import type { MasterDataCategory } from '@/lib/design/masterData'

// Every pilihan below is sourced from the `design_master_options` table
// (Single Source of Truth) — no hardcoded option lists live here anymore.
// `button` is the "Kancing & Aksesori" pilihan, backed by the 'aksesori'
// master data category.
export interface DesignSelections {
  model: string
  lookCutting: string
  fabric: string
  color: string
  collar: string
  cuff: string
  plaket: string
  pocket: string
  button: string
  // Design Specification Foundation sprint additions — 'bordir' and
  // 'handmade_zigzag' master data categories already existed as standalone
  // catalogs; these two fields are what finally give them a DesignSelections
  // home so they can be chosen and translated into the Design Specification.
  embroidery: string
  handmadeZigzag: string
}

// Maps each Design Studio field to the master data category it's sourced
// from — the one place that ties the two vocabularies together.
export const CATEGORY_BY_FIELD: Record<keyof DesignSelections, MasterDataCategory> = {
  model: 'model_thobe',
  lookCutting: 'look_cutting',
  fabric: 'bahan',
  color: 'warna_bahan',
  collar: 'kerah',
  cuff: 'manset',
  plaket: 'plaket',
  pocket: 'saku',
  button: 'aksesori',
  embroidery: 'bordir',
  handmadeZigzag: 'handmade_zigzag',
}

// Plain empty fallback shape — real values always come from either a saved
// consultation (decodeDesignNotes) or the first active master data option
// per category (see DesignStudioWorkspace), never from a hardcoded label.
export const DEFAULT_SELECTIONS: DesignSelections = {
  model: '',
  lookCutting: '',
  fabric: '',
  color: '',
  collar: '',
  cuff: '',
  plaket: '',
  pocket: '',
  button: '',
  embroidery: '',
  handmadeZigzag: '',
}

// Domain-level sentinel for "customer explicitly chose not to use this
// component" — NOT a master data row (per the Support Optional Selection
// brief: "Sebisa mungkin tidak membuat record dummy '(None)' di database").
// Stored in DesignSelections/consultations.notes exactly like a real option
// name would be, but resolveOption() (buildSpecification.ts) recognizes it
// and resolves straight to `null` without a catalog lookup — the same
// `null` every other unresolved/skipped field already produces, so every
// downstream stage (Price Snapshot, renderService's componentSelections
// filter, DNA Resolver, Recipe Composer, Prompt Builder) skips it for free,
// with zero changes needed in any of those layers.
export const NONE_SELECTION = '__none__'

export function isNoneSelection(value: string): boolean {
  return value === NONE_SELECTION
}

// Real tailoring logic (see Support Optional Selection audit): a pilihan may
// only offer "(None)" when skipping it is a genuine, common design choice
// ("Modelnya bebas", "Tidak pakai plaket", "Tidak ada saku") — never for a
// component every garment must structurally have SOME resolution for
// (Bahan/Warna Bahan can't render without a material+color; Kerah/Manset
// must always be a real catalog item, even a "Tanpa Kerah" one, because
// "no neckline decision at all" isn't a renderable state).
export const OPTIONAL_FIELDS: ReadonlySet<keyof DesignSelections> = new Set<keyof DesignSelections>([
  'model',
  'lookCutting',
  'plaket',
  'pocket',
  'button',
  'embroidery',
  'handmadeZigzag',
])

// Human label for the sentinel wherever a raw DesignSelections value (not a
// resolved DesignSpecOptionRef) is displayed directly — footer/summary
// panels must never leak the literal `__none__` string to a screen.
export function displaySelection(value: string): string {
  return isNoneSelection(value) ? '(None)' : value
}
