import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdditionalCostRow, MaterialEstimateRow, MaterialEstimateTemplate } from './types'

// Estimasi Biaya's "Simpan Template" / "Gunakan Template" — templates are
// global (reusable for any future order, not scoped to one material), same
// admin/owner RLS shape as material_categories.

interface TemplateRow {
  id: string
  name: string
  material_rows: MaterialEstimateRow[]
  additional_costs: AdditionalCostRow[]
  harga_jual: number | null
  catatan: string | null
  created_at: string
}

function toTemplate(row: TemplateRow): MaterialEstimateTemplate {
  return {
    id: row.id,
    name: row.name,
    materialRows: row.material_rows ?? [],
    additionalCosts: row.additional_costs ?? [],
    hargaJual: row.harga_jual,
    catatan: row.catatan ?? '',
    created_at: row.created_at,
  }
}

export async function fetchCostTemplates(supabase: SupabaseClient): Promise<MaterialEstimateTemplate[]> {
  const { data, error } = await supabase
    .from('material_cost_templates')
    .select('id, name, material_rows, additional_costs, harga_jual, catatan, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as TemplateRow[]).map(toTemplate)
}

export async function saveCostTemplate(
  supabase: SupabaseClient,
  params: {
    name: string
    materialRows: MaterialEstimateRow[]
    additionalCosts: AdditionalCostRow[]
    hargaJual: number | null
    catatan: string
  }
): Promise<void> {
  const { error } = await supabase.from('material_cost_templates').insert({
    name: params.name.trim(),
    material_rows: params.materialRows,
    additional_costs: params.additionalCosts,
    harga_jual: params.hargaJual,
    catatan: params.catatan,
  })
  if (error) throw error
}
