import type { SupabaseClient } from '@supabase/supabase-js'
import {
  fetchActiveMasterOptions,
  type MasterDataCategory,
  type MasterDataOption,
} from '@/lib/design/masterData'
import type {
  ConfiguratorField,
  ConfiguratorOption,
  ConfiguratorOptionsByField,
} from '@/types/configurator'

// Configurator website integration layer — the ONLY place that translates
// LTOS Design Studio's Product Knowledge Base (design_master_options) into
// the shape this public configurator consumes. Reuses the existing
// fetchActiveMasterOptions read path as-is; never queries the table
// directly and never writes to it, so Design Studio itself is untouched.
const FIELD_CATEGORY_MAP: Record<ConfiguratorField, MasterDataCategory> = {
  modelId: 'model_thobe',
  collarId: 'kerah',
  cuffId: 'manset',
  fabricId: 'bahan',
  colorId: 'warna_bahan',
  embroidery: 'bordir',
}

const ACCESSORIES_CATEGORY: MasterDataCategory = 'aksesori'

function toConfiguratorOption(row: MasterDataOption): ConfiguratorOption {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    price: row.price,
    photoUrl: row.photo_url,
    sellingPoints: row.selling_points,
    sortOrder: row.sort_order,
  }
}

export interface ConfiguratorCatalog {
  fields: ConfiguratorOptionsByField
  accessories: ConfiguratorOption[]
}

// Fetches the live, active-only Master Data and reshapes it for the
// configurator. Read-only — safe to call from a Server Component or an API
// route.
export async function getConfiguratorCatalog(supabase: SupabaseClient): Promise<ConfiguratorCatalog> {
  const grouped = await fetchActiveMasterOptions(supabase)

  const fields = Object.fromEntries(
    (Object.keys(FIELD_CATEGORY_MAP) as ConfiguratorField[]).map((field) => [
      field,
      (grouped[FIELD_CATEGORY_MAP[field]] ?? []).map(toConfiguratorOption),
    ])
  ) as ConfiguratorOptionsByField

  const accessories = (grouped[ACCESSORIES_CATEGORY] ?? []).map(toConfiguratorOption)

  return { fields, accessories }
}

export function findOption(options: ConfiguratorOption[], id: string | null): ConfiguratorOption | null {
  if (!id) return null
  return options.find((option) => option.id === id) ?? null
}
