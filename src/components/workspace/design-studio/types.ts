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
