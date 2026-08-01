import type { SupabaseClient } from '@supabase/supabase-js'
import type { DnaColor } from './dnaColors'

// Material Color — the operational bridge between a real Inventory Material
// (article: Twill/Oxford/Lorenzo, `materials` table) and a DNA Color,
// carrying the supplier's own code for that specific material+color
// combination. Never sent to AI Render — only supplier_color_code/
// supplier_color_name are operational, dna_colors.prompt is the only color
// content the render pipeline ever reads.
export interface MaterialColor {
  id: string
  material_id: string
  dna_color_id: string
  supplier_color_code: string
  supplier_color_name: string | null
  is_active: boolean
  stock: number | null
  created_at: string
  updated_at: string
  // Joined
  dna_colors?: Pick<DnaColor, 'id' | 'name' | 'hex' | 'status'>
}

export async function fetchMaterialColorsForMaterial(
  supabase: SupabaseClient,
  materialId: string
): Promise<MaterialColor[]> {
  const { data, error } = await supabase
    .from('material_colors')
    .select('*, dna_colors(id, name, hex, status)')
    .eq('material_id', materialId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as MaterialColor[]
}

// Batch read for Design Studio — one query for every Fabric option's linked
// material_id, grouped back by material_id, only active mappings to an
// active DNA Color (an archived DNA Color must not surface as pickable).
export async function fetchMaterialColorsForMaterials(
  supabase: SupabaseClient,
  materialIds: string[]
): Promise<Map<string, MaterialColor[]>> {
  const ids = materialIds.filter(Boolean)
  if (ids.length === 0) return new Map()

  const { data, error } = await supabase
    .from('material_colors')
    .select('*, dna_colors(id, name, hex, status)')
    .in('material_id', ids)
    .eq('is_active', true)
    .eq('dna_colors.status', 'active')

  if (error) throw error

  const byMaterial = new Map<string, MaterialColor[]>()
  for (const row of (data ?? []) as MaterialColor[]) {
    if (!row.dna_colors) continue // filtered out by the dna_colors.status join above
    const list = byMaterial.get(row.material_id) ?? []
    list.push(row)
    byMaterial.set(row.material_id, list)
  }
  return byMaterial
}

export interface MaterialColorInput {
  materialId: string
  dnaColorId: string
  supplierColorCode: string
  supplierColorName?: string | null
  stock?: number | null
}

export async function addMaterialColor(supabase: SupabaseClient, params: MaterialColorInput): Promise<void> {
  const { error } = await supabase.from('material_colors').insert({
    material_id: params.materialId,
    dna_color_id: params.dnaColorId,
    supplier_color_code: params.supplierColorCode.trim(),
    supplier_color_name: params.supplierColorName?.trim() || null,
    stock: params.stock ?? null,
  })

  if (error) throw error
}

// Partial by design — only the fields actually passed are written, so an
// editor that only ever touches DNA Color/Supplier Code/Supplier Name (the
// Material Master "Edit" row) can never silently null out `stock`.
export async function updateMaterialColor(
  supabase: SupabaseClient,
  id: string,
  params: Partial<Pick<MaterialColorInput, 'dnaColorId' | 'supplierColorCode' | 'supplierColorName' | 'stock'>>
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (params.dnaColorId !== undefined) update.dna_color_id = params.dnaColorId
  if (params.supplierColorCode !== undefined) update.supplier_color_code = params.supplierColorCode.trim()
  if (params.supplierColorName !== undefined) update.supplier_color_name = params.supplierColorName?.trim() || null
  if (params.stock !== undefined) update.stock = params.stock

  const { error } = await supabase.from('material_colors').update(update).eq('id', id)
  if (error) throw error
}

// Deactivate, never delete — same "Nonaktifkan" precedent as the rest of
// this app (a past order's Price Snapshot/render never needs this mapping
// removed retroactively, only hidden from new picking).
export async function deactivateMaterialColor(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('material_colors')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
