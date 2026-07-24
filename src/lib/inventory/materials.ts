import type { SupabaseClient } from '@supabase/supabase-js'
import type { Material, MaterialCategory, MaterialUsage, StockMovement } from './types'

export async function fetchCategories(supabase: SupabaseClient): Promise<MaterialCategory[]> {
  const { data, error } = await supabase
    .from('material_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []) as MaterialCategory[]
}

export async function createCategory(supabase: SupabaseClient, name: string): Promise<void> {
  const { data: existing } = await supabase
    .from('material_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase
    .from('material_categories')
    .insert({ name: name.trim(), sort_order: (existing?.sort_order ?? 0) + 1 })

  if (error) throw error
}

export async function fetchMaterials(supabase: SupabaseClient): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*, material_categories(*)')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Material[]
}

export interface CreateMaterialParams {
  category_id: string
  name: string
  sku?: string | null
  unit: string
  price?: number
  min_stock?: number
  location?: string | null
  supplier?: string | null
  default_color?: string | null
}

export async function createMaterial(supabase: SupabaseClient, params: CreateMaterialParams): Promise<void> {
  const { error } = await supabase.from('materials').insert({
    category_id: params.category_id,
    name: params.name.trim(),
    sku: params.sku?.trim() || null,
    unit: params.unit,
    price: params.price ?? 0,
    min_stock: params.min_stock ?? 0,
    location: params.location?.trim() || null,
    supplier: params.supplier?.trim() || null,
    default_color: params.default_color?.trim() || null,
  })

  if (error) throw error
}

export interface UpdateMaterialParams {
  category_id: string
  name: string
  sku?: string | null
  unit: string
  price: number
  min_stock: number
  location: string | null
  photo_url?: string | null
  is_active?: boolean
  supplier?: string | null
  default_color?: string | null
}

export async function updateMaterial(supabase: SupabaseClient, id: string, params: UpdateMaterialParams): Promise<void> {
  // supplier/default_color only ever come from the Material Master admin
  // page (/owner/material-master) — Inventory's own MaterialFormModal never
  // passes them, so they must be omitted (not defaulted to null) here or
  // every stock-only save from Inventory would silently wipe them.
  const { error } = await supabase
    .from('materials')
    .update({
      category_id: params.category_id,
      name: params.name.trim(),
      sku: params.sku?.trim() || null,
      unit: params.unit,
      price: params.price,
      min_stock: params.min_stock,
      location: params.location?.trim() || null,
      photo_url: params.photo_url ?? null,
      is_active: params.is_active ?? true,
      ...(params.supplier !== undefined && { supplier: params.supplier?.trim() || null }),
      ...(params.default_color !== undefined && { default_color: params.default_color?.trim() || null }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}

// Same deterministic-path-and-upsert shape as uploadMasterDataPhoto in
// src/lib/design/masterData.ts, pointed at its own bucket.
export async function uploadMaterialPhoto(
  supabase: SupabaseClient,
  params: { materialId: string; file: File }
): Promise<string> {
  const ext = params.file.name.split('.').pop() || 'jpg'
  const path = `${params.materialId}.${ext}`

  const { error } = await supabase.storage
    .from('material-photos')
    .upload(path, params.file, { upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from('material-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function fetchMaterialMovements(supabase: SupabaseClient, materialId: string): Promise<StockMovement[]> {
  const { data, error } = await supabase
    .from('material_stock_movements')
    .select('*, profiles(name)')
    .eq('material_id', materialId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as StockMovement[]
}

// "Digunakan oleh" — reservation movements for this material that haven't
// been fully released yet, joined out to the order/customer they belong
// to. Aggregated client-side (reservation minus release, per order) rather
// than a SQL view, since the ledger is small per material and this is
// read-only display data for the drawer, not a hot path.
export async function fetchMaterialUsage(supabase: SupabaseClient, materialId: string): Promise<MaterialUsage[]> {
  const { data: movements, error } = await supabase
    .from('material_stock_movements')
    .select('order_id, movement_type, quantity')
    .eq('material_id', materialId)
    .not('order_id', 'is', null)
    .in('movement_type', ['reservation', 'release'])

  if (error) throw error

  const netByOrder = new Map<string, number>()
  for (const m of movements ?? []) {
    const orderId = m.order_id as string
    const delta = m.movement_type === 'reservation' ? m.quantity : -m.quantity
    netByOrder.set(orderId, (netByOrder.get(orderId) ?? 0) + delta)
  }

  const activeOrderIds = Array.from(netByOrder.entries()).filter(([, qty]) => qty > 0).map(([orderId]) => orderId)
  if (activeOrderIds.length === 0) return []

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, current_state, customers(name)')
    .in('id', activeOrderIds)

  if (ordersError) throw ordersError

  return (orders ?? []).map(o => {
    const customer = Array.isArray(o.customers) ? o.customers[0] : o.customers
    return {
      orderId: o.id,
      orderNumber: o.order_number,
      customerName: customer?.name || 'Unknown',
      quantity: netByOrder.get(o.id) ?? 0,
      currentState: o.current_state,
    }
  })
}

// "Digunakan di Fitter App" badge (Material Workspace card) — which
// materials are actually linked into the Design Studio catalog via
// design_master_options.material_id. Read-only, admin/owner only (same
// access as the rest of this module), so no RLS change was needed.
export async function fetchMaterialIdsUsedInDesign(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('design_master_options')
    .select('material_id')
    .eq('is_active', true)
    .not('material_id', 'is', null)

  if (error) throw error
  return new Set((data ?? []).map(row => row.material_id as string))
}

// Fitter's live-stock read path (FabricSelector) — a simple name match
// against active materials, read-only. Returns a lookup map so the caller
// fetches once for the whole 'bahan' catalog rather than per-option.
export async function fetchMaterialStockByName(
  supabase: SupabaseClient,
  names: string[]
): Promise<Map<string, Pick<Material, 'available_stock' | 'min_stock' | 'unit'>>> {
  if (names.length === 0) return new Map()

  const { data, error } = await supabase
    .from('materials')
    .select('name, available_stock, min_stock, unit')
    .eq('is_active', true)
    .in('name', names)

  if (error) throw error

  return new Map((data ?? []).map(m => [m.name, m]))
}
