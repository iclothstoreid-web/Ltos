import type { SupabaseClient } from '@supabase/supabase-js'
import type { MasterDataCategory } from '@/lib/design/masterData'
import type {
  ConfiguratorField,
  ConfiguratorOption,
  ConfiguratorOptionsByField,
} from '@/types/configurator'

// Configurator website integration layer — the ONLY place that translates
// LTOS Design Studio's Product Knowledge Base (design_master_options) into
// the shape this public configurator consumes. Reads via
// list_active_design_master_options() (Sprint W3-4, SECURITY DEFINER RPC —
// see supabase/migrations/20260908000000_sprint_w3_4_public_configurator_rpc_fix.sql),
// never the raw table: design_master_options' only RLS SELECT policy
// requires a staff auth.uid(), so a plain anon-context table read here
// returned nothing for every real visitor from Sprint W2 until this RPC
// existed. Design Studio's own staff-authenticated reads
// (fetchActiveMasterOptions in masterData.ts) are untouched by this file.
const FIELD_CATEGORY_MAP: Record<ConfiguratorField, MasterDataCategory> = {
  modelId: 'model_thobe',
  collarId: 'kerah',
  cuffId: 'manset',
  fabricId: 'bahan',
  colorId: 'warna_bahan',
  embroidery: 'bordir',
}

const ACCESSORIES_CATEGORY: MasterDataCategory = 'aksesori'

interface PublicMasterOptionRow {
  id: string
  category: MasterDataCategory
  name: string
  price: number
  photo_url: string | null
  selling_points: string[] | null
  sort_order: number
  material_id: string | null
  dna_color_id: string | null
}

function toConfiguratorOption(row: PublicMasterOptionRow): ConfiguratorOption {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    price: row.price,
    photoUrl: row.photo_url,
    sellingPoints: row.selling_points ?? [],
    sortOrder: row.sort_order,
    materialId: row.material_id,
    dnaColorId: row.dna_color_id,
  }
}

export interface ConfiguratorCatalog {
  fields: ConfiguratorOptionsByField
  accessories: ConfiguratorOption[]
}

// Fetches the live, active-only Master Data (public-safe columns only) and
// reshapes it for the configurator. Read-only — safe to call from a Server
// Component or an API route, anon or authenticated.
export async function getConfiguratorCatalog(supabase: SupabaseClient): Promise<ConfiguratorCatalog> {
  const { data, error } = await supabase.rpc('list_active_design_master_options')
  if (error) throw error
  // Already ordered (category, sort_order) by the RPC itself.
  const rows = (data ?? []) as PublicMasterOptionRow[]

  const fields = Object.fromEntries(
    (Object.keys(FIELD_CATEGORY_MAP) as ConfiguratorField[]).map((field) => [
      field,
      rows.filter((row) => row.category === FIELD_CATEGORY_MAP[field]).map(toConfiguratorOption),
    ])
  ) as ConfiguratorOptionsByField

  const accessories = rows.filter((row) => row.category === ACCESSORIES_CATEGORY).map(toConfiguratorOption)

  return { fields, accessories }
}

export function findOption(options: ConfiguratorOption[], id: string | null): ConfiguratorOption | null {
  if (!id) return null
  return options.find((option) => option.id === id) ?? null
}

// Sprint W3-4 — resolves a Fabric Explorer material_id/dna_color_id
// (real materials.id / dna_colors.id, already resolved from a URL slug) to
// the configurator option that represents it, if any. A material/color
// that exists in Material Master / DNA Color Repository but was never
// linked into the (separately curated) Design Studio catalog simply
// returns null — the caller's "fallback normal" behavior for that field.
export function findOptionByMaterialId(options: ConfiguratorOption[], materialId: string | null): ConfiguratorOption | null {
  if (!materialId) return null
  return options.find((option) => option.materialId === materialId) ?? null
}

export function findOptionByDnaColorId(options: ConfiguratorOption[], dnaColorId: string | null): ConfiguratorOption | null {
  if (!dnaColorId) return null
  return options.find((option) => option.dnaColorId === dnaColorId) ?? null
}
