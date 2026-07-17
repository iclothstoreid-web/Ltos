import type { SupabaseClient } from '@supabase/supabase-js'

// Single reusable structure for every Design Studio pilihan category (Model
// Thobe, Look Cutting, Kerah, Manset, Plaket, Saku, Bahan, Warna Bahan,
// Aksesori) — one table instead of one-table-per-category, per the brief
// ("Hindari membuat satu tabel untuk setiap kategori"). `metadata` carries
// category-specific extras (e.g. Warna Bahan's hex code) without needing
// extra columns.
export const MASTER_DATA_CATEGORIES = [
  'model_thobe',
  'look_cutting',
  'kerah',
  'manset',
  'plaket',
  'saku',
  'bahan',
  'warna_bahan',
  'aksesori',
] as const

export type MasterDataCategory = (typeof MASTER_DATA_CATEGORIES)[number]

export const MASTER_DATA_CATEGORY_LABELS: Record<MasterDataCategory, string> = {
  model_thobe: 'Model Thobe',
  look_cutting: 'Look Cutting',
  kerah: 'Kerah',
  manset: 'Manset',
  plaket: 'Plaket',
  saku: 'Saku',
  bahan: 'Bahan',
  warna_bahan: 'Warna Bahan',
  aksesori: 'Aksesori',
}

export interface MasterDataOption {
  id: string
  category: MasterDataCategory
  name: string
  metadata: Record<string, string>
  sort_order: number
  is_active: boolean
}

export type MasterOptionsByCategory = Record<MasterDataCategory, MasterDataOption[]>

function emptyGroups(): MasterOptionsByCategory {
  return MASTER_DATA_CATEGORIES.reduce((acc, category) => {
    acc[category] = []
    return acc
  }, {} as MasterOptionsByCategory)
}

function groupByCategory(rows: MasterDataOption[]): MasterOptionsByCategory {
  const groups = emptyGroups()
  rows.forEach(row => {
    groups[row.category].push(row)
  })
  return groups
}

// Design Studio only ever offers active options to pick from.
export async function fetchActiveMasterOptions(
  supabase: SupabaseClient
): Promise<MasterOptionsByCategory> {
  const { data, error } = await supabase
    .from('design_master_options')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw error
  return groupByCategory((data ?? []) as MasterDataOption[])
}

// Master Data admin management needs both active and nonaktif rows so
// nothing already used by an Order silently disappears from view.
export async function fetchAllMasterOptions(supabase: SupabaseClient): Promise<MasterOptionsByCategory> {
  const { data, error } = await supabase
    .from('design_master_options')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw error
  return groupByCategory((data ?? []) as MasterDataOption[])
}

export function firstActiveOptionName(options: MasterDataOption[] | undefined): string {
  return options && options.length > 0 ? options[0].name : ''
}

export async function createMasterDataOption(
  supabase: SupabaseClient,
  params: { category: MasterDataCategory; name: string; metadata?: Record<string, string> }
): Promise<void> {
  const { data: existing } = await supabase
    .from('design_master_options')
    .select('sort_order')
    .eq('category', params.category)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('design_master_options').insert({
    category: params.category,
    name: params.name.trim(),
    metadata: params.metadata ?? {},
    sort_order: (existing?.sort_order ?? 0) + 1,
  })

  if (error) throw error
}

export async function updateMasterDataOption(
  supabase: SupabaseClient,
  id: string,
  params: { name: string; metadata?: Record<string, string> }
): Promise<void> {
  const { error } = await supabase
    .from('design_master_options')
    .update({ name: params.name.trim(), metadata: params.metadata ?? {}, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// Never a hard delete — Order history may already reference this option by
// name, so it's kept but marked nonaktif and excluded from future pilihan.
export async function deactivateMasterDataOption(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('design_master_options')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
