import type { SupabaseClient } from '@supabase/supabase-js'
import type { MasterDataCategory } from '@/lib/design/masterData'
import { CATEGORY_BY_FIELD, type DesignSelections } from '@/components/workspace/design-studio/types'

// Public, anon-safe design catalog for the Customer Self-Service
// Consultation Link — reads via list_active_design_master_options()
// (Sprint W3-4, SECURITY DEFINER RPC granted to anon), the exact same
// public data source the marketing /design-studio configurator already
// uses (see src/lib/configurator/mapping.ts's own doc comment: the raw
// `design_master_options` table's only RLS SELECT policy requires a staff
// auth.uid(), so a plain anon table read here would return nothing).
// Grouped by MasterDataCategory (not ConfiguratorField) so it lines up
// directly with DesignSelections/CATEGORY_BY_FIELD, the same vocabulary the
// internal Fitter-facing Design Studio and its notes codec use.
export interface PublicDesignOption {
  id: string
  name: string
  price: number
  photo_url: string | null
  color_hex: string | null
  sort_order: number
}

export type PublicDesignOptionsByCategory = Partial<Record<MasterDataCategory, PublicDesignOption[]>>

interface PublicMasterOptionRpcRow {
  id: string
  category: MasterDataCategory
  name: string
  price: number
  photo_url: string | null
  color_hex: string | null
  selling_points: string[] | null
  sort_order: number
  material_id: string | null
  dna_color_id: string | null
}

export async function fetchPublicDesignOptions(supabase: SupabaseClient): Promise<PublicDesignOptionsByCategory> {
  const { data, error } = await supabase.rpc('list_active_design_master_options')
  if (error) throw error

  const rows = (data ?? []) as PublicMasterOptionRpcRow[]
  const grouped: PublicDesignOptionsByCategory = {}
  for (const row of rows) {
    const list = grouped[row.category] ?? []
    list.push({
      id: row.id,
      name: row.name,
      price: row.price,
      photo_url: row.photo_url,
      color_hex: row.color_hex,
      sort_order: row.sort_order,
    })
    grouped[row.category] = list
  }
  return grouped
}

export function optionsForField(
  catalog: PublicDesignOptionsByCategory,
  field: keyof DesignSelections
): PublicDesignOption[] {
  return catalog[CATEGORY_BY_FIELD[field]] ?? []
}

// Server-side whitelist check before any submitted design selection reaches
// consultations.notes — an id that doesn't exist (or isn't active) under
// the field's category is silently dropped by the caller rather than
// trusted, so a stale/tampered client can never write an id from the wrong
// category or one that was deactivated after the page loaded.
export function isValidSelection(
  catalog: PublicDesignOptionsByCategory,
  field: keyof DesignSelections,
  id: string
): boolean {
  return optionsForField(catalog, field).some((option) => option.id === id)
}
