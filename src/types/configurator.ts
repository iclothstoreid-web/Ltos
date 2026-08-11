import type { MasterDataCategory } from '@/lib/design/masterData'
import type { ServiceLevel } from '@/lib/order/service'

export type { ServiceLevel }

// Public-safe fields of a LTOS Product Knowledge Base row — never carries
// ai_dna/render_recipe/internal_notes/construction_type, matching the
// column allowlist public.list_active_design_master_options() (Sprint
// W3-4) exposes to anon. materialId/dnaColorId are plain UUIDs (no
// business content) — Fabric Explorer's Design Studio deep-link
// (?fabric=slug&color=slug) matches against them to preselect a 'bahan'/
// 'warna_bahan' option server-side.
export interface ConfiguratorOption {
  id: string
  category: MasterDataCategory
  name: string
  price: number
  photoUrl: string | null
  sellingPoints: string[]
  sortOrder: number
  materialId: string | null
  dnaColorId: string | null
}

// One selectable slot in the configurator. Each maps to exactly one Master
// Data category via CONFIGURATOR_FIELD_CATEGORY_MAP (lib/configurator/mapping.ts).
export type ConfiguratorField =
  | 'modelId'
  | 'collarId'
  | 'cuffId'
  | 'fabricId'
  | 'colorId'
  | 'embroidery'

export type ConfiguratorOptionsByField = Record<ConfiguratorField, ConfiguratorOption[]>

// Customer's in-progress selection state. Kept intentionally minimal per
// the W2-1 brief — `accessories` is multi-select (array of Master Data
// ids), every other slot is single-select.
export interface DesignConfig {
  modelId: string | null
  collarId: string | null
  cuffId: string | null
  fabricId: string | null
  colorId: string | null
  embroidery: string | null
  accessories: string[]
}

export function emptyDesignConfig(): DesignConfig {
  return {
    modelId: null,
    collarId: null,
    cuffId: null,
    fabricId: null,
    colorId: null,
    embroidery: null,
    accessories: [],
  }
}

// 'base' (the Model) and 'service' (the rush surcharge) aren't tied to a
// ConfiguratorField-selectable master-data category the way the others
// are, so EstimateLine gets its own kind enum rather than reusing
// ConfiguratorField.
export type EstimateLineKind = 'base' | 'fabric' | 'collar' | 'cuff' | 'embroidery' | 'accessories' | 'service'

export interface EstimateLine {
  kind: EstimateLineKind
  label: string
  amount: number
  optionId?: string
}

// W2-3 (Pricing & ETA Engine) shape. Still a placeholder, not the real
// Commercial/SLA Engine — see src/lib/configurator/estimate.ts and eta.ts
// for exactly which numbers are placeholder vs. sourced from real LTOS
// business rules.
export interface Estimate {
  status: 'idle' | 'calculating' | 'ready' | 'error'
  breakdown: EstimateLine[]
  subtotal: number
  serviceLevel: ServiceLevel
  serviceSurcharge: number
  total: number
  currency: string
  productionDays: number
  completionDate: string | null
  completionDateFormatted: string | null
  updatedAt: string | null
}

export function emptyEstimate(serviceLevel: ServiceLevel = 'standard'): Estimate {
  return {
    status: 'idle',
    breakdown: [],
    subtotal: 0,
    serviceLevel,
    serviceSurcharge: 0,
    total: 0,
    currency: 'IDR',
    productionDays: 0,
    completionDate: null,
    completionDateFormatted: null,
    updatedAt: null,
  }
}
