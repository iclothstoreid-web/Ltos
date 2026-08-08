import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Material,
  MaterialAttentionItem,
  MaterialCategory,
  MaterialOrderUsage,
  MaterialUsageRanking,
  MaterialUsageStatus,
  OrderMaterialCost,
  OrderMaterialUsage,
  StockMovement,
} from './types'
import { materialStockStatus } from './types'

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

export async function updateCategory(supabase: SupabaseClient, id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('material_categories')
    .update({ name: name.trim() })
    .eq('id', id)

  if (error) throw error
}

// materials.category_id is `not null references material_categories(id)`
// with no ON DELETE clause (default RESTRICT) -- deleting a category still
// referenced by a material would surface as a raw foreign-key violation.
// Checked up front so the caller gets a message it can show directly
// instead of a Postgres error code.
export async function deleteCategory(supabase: SupabaseClient, id: string): Promise<void> {
  const { count, error: countError } = await supabase
    .from('materials')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (countError) throw countError
  if ((count ?? 0) > 0) {
    throw new Error('Kategori masih digunakan oleh material — pindahkan material ke kategori lain terlebih dahulu.')
  }

  const { error } = await supabase.from('material_categories').delete().eq('id', id)
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
}

export async function updateMaterial(supabase: SupabaseClient, id: string, params: UpdateMaterialParams): Promise<void> {
  // supplier only ever comes from the Material Master admin page
  // (/owner/material-master) — Inventory's own MaterialFormModal never
  // passes it, so it must be omitted (not defaulted to null) here or every
  // stock-only save from Inventory would silently wipe it.
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

// Fetch Strategy (STEP 5.4, pagination) — "Riwayat Stok" in MaterialDetailDrawer
// is a fixed-size drawer panel, not an infinite-scroll view; a hot material's
// full lifetime ledger has no bound otherwise. Capped to the 200 most recent
// movements (already newest-first). fetchMaterialOrderHistory below is a
// separate, unlimited query — it nets reserved/released totals per order and
// needs the complete ledger to stay correct, so it's untouched.
export async function fetchMaterialMovements(supabase: SupabaseClient, materialId: string): Promise<StockMovement[]> {
  const { data, error } = await supabase
    .from('material_stock_movements')
    .select('*, profiles(name)')
    .eq('material_id', materialId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error
  return (data ?? []) as StockMovement[]
}

function usageStatus(reserved: number, released: number): MaterialUsageStatus {
  if (released <= 0) return 'reserved'
  return released >= reserved ? 'released' : 'partial'
}

// Sprint I.2 — "dipakai order apa saja, status order, total penggunaan" for
// Material Detail. Reads the full order history for this material (not just
// currently-active reservations), netting reservation/release per order from
// the same ledger fetchMaterialMovements already reads for Riwayat Stok.
// Aggregated client-side rather than a SQL view for the same reason as
// before: the ledger is small per material, this is read-only display data.
//
// 'stock_out' (with an order_id) is Persiapan Bahan's direct consumption —
// the "Pindahkan Konsumsi Inventory ke Production" sprint retired the old
// reserve/release two-step, so there's no separate "reserved" moment to net
// against anymore: it counts as both reserved and released at once (fully
// used, status 'released'), same as a reservation that was released in full.
export async function fetchMaterialOrderHistory(supabase: SupabaseClient, materialId: string): Promise<MaterialOrderUsage[]> {
  const { data: movements, error } = await supabase
    .from('material_stock_movements')
    .select('order_id, movement_type, quantity')
    .eq('material_id', materialId)
    .not('order_id', 'is', null)
    .in('movement_type', ['reservation', 'release', 'stock_out'])

  if (error) throw error

  const byOrder = new Map<string, { reserved: number; released: number }>()
  for (const m of movements ?? []) {
    const orderId = m.order_id as string
    const entry = byOrder.get(orderId) ?? { reserved: 0, released: 0 }
    if (m.movement_type === 'reservation') entry.reserved += m.quantity
    else if (m.movement_type === 'stock_out') {
      entry.reserved += m.quantity
      entry.released += m.quantity
    } else entry.released += m.quantity
    byOrder.set(orderId, entry)
  }

  const orderIds = Array.from(byOrder.keys())
  if (orderIds.length === 0) return []

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, current_state, customers(name)')
    .in('id', orderIds)

  if (ordersError) throw ordersError

  return (orders ?? []).map(o => {
    const customer = Array.isArray(o.customers) ? o.customers[0] : o.customers
    const entry = byOrder.get(o.id)!
    return {
      orderId: o.id,
      orderNumber: o.order_number,
      customerName: customer?.name || 'Unknown',
      currentState: o.current_state,
      reservedQty: entry.reserved,
      releasedQty: entry.released,
      netQty: Math.max(entry.reserved - entry.released, 0),
      status: usageStatus(entry.reserved, entry.released),
    }
  })
}

// Sprint I.2 — reverse direction: "material yang dipakai, jumlah, status"
// for Order Detail. Same ledger, filtered by order_id instead of
// material_id, joined out to the materials it touched.
export async function fetchOrderMaterialUsage(supabase: SupabaseClient, orderId: string): Promise<OrderMaterialUsage[]> {
  const { data, error } = await supabase
    .from('material_stock_movements')
    .select('material_id, movement_type, quantity, materials(name, unit)')
    .eq('order_id', orderId)
    .in('movement_type', ['reservation', 'release', 'stock_out'])

  if (error) throw error

  const byMaterial = new Map<string, { name: string; unit: string; reserved: number; released: number }>()
  for (const row of data ?? []) {
    const material = Array.isArray(row.materials) ? row.materials[0] : row.materials
    const materialId = row.material_id as string
    const entry = byMaterial.get(materialId) ?? { name: material?.name ?? 'Material', unit: material?.unit ?? '', reserved: 0, released: 0 }
    if (row.movement_type === 'reservation') entry.reserved += row.quantity
    else if (row.movement_type === 'stock_out') {
      entry.reserved += row.quantity
      entry.released += row.quantity
    } else entry.released += row.quantity
    byMaterial.set(materialId, entry)
  }

  return Array.from(byMaterial.entries()).map(([materialId, entry]) => ({
    materialId,
    name: entry.name,
    unit: entry.unit,
    reservedQty: entry.reserved,
    releasedQty: entry.released,
    netQty: Math.max(entry.reserved - entry.released, 0),
    status: usageStatus(entry.reserved, entry.released),
  }))
}

// Sprint N.3 (Margin Per Order Foundation) — Cost(actual) for one order.
// Reuses the exact same table/filter shape as fetchOrderMaterialUsage above
// (material_stock_movements scoped to order_id), narrowed to 'stock_out'
// only -- the one movement_type save_material_preparation() writes for a
// real physical deduction (see 20260819000000_move_inventory_consumption_to_production.sql).
// Manual Stock Keluar from Inventory Hub also uses 'stock_out' but never
// sets order_id, so this filter cannot pick up unrelated manual movements.
// price is read-time joined from `materials` (never denormalized, same
// ADR-014 convention material_cost_templates already follows) -- this is a
// plain table read, no new RPC, no new table.
export async function fetchOrderMaterialCost(supabase: SupabaseClient, orderId: string): Promise<OrderMaterialCost> {
  const { data, error } = await supabase
    .from('material_stock_movements')
    .select('quantity, materials(price)')
    .eq('order_id', orderId)
    .eq('movement_type', 'stock_out')

  if (error) throw error
  const rows = data ?? []
  if (rows.length === 0) return { hasData: false, totalCost: 0 }

  const totalCost = rows.reduce((sum, row) => {
    const material = Array.isArray(row.materials) ? row.materials[0] : row.materials
    const price = Number(material?.price ?? 0)
    const quantity = Number(row.quantity ?? 0)
    return sum + price * quantity
  }, 0)

  return { hasData: true, totalCost }
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

// Material Intelligence (Sprint I.1) — "perlu perhatian" list. Reuses
// materialStockStatus() for classification and the same reorder-qty
// heuristic (min_stock * 2 - available, floored at 1) Command Center's
// page.tsx already computes inline for the Inventory Alert Decision Card —
// extracted here as a pure function over an already-fetched materials array
// (no new query) so both surfaces can share one definition instead of
// re-deriving it. Sorted by available/minStock ascending (lowest ratio =
// most critical first), same as Command Center's "most critical" sort.
export function getMaterialAttentionList(
  materials: Pick<Material, 'id' | 'name' | 'unit' | 'available_stock' | 'min_stock' | 'is_active'>[]
): MaterialAttentionItem[] {
  return materials
    .filter(m => m.is_active && materialStockStatus(m) !== 'aman')
    .map(m => ({
      materialId: m.id,
      name: m.name,
      unit: m.unit,
      availableStock: m.available_stock,
      minStock: m.min_stock,
      status: materialStockStatus(m),
      reorderQty: Math.max(m.min_stock * 2 - m.available_stock, 1),
    }))
    .sort((a, b) => a.availableStock / (a.minStock || 1) - b.availableStock / (b.minStock || 1))
}

// "Material paling banyak dipakai" — sums real physical consumption from the
// existing stock ledger. Both 'release' (legacy, pre-Sprint reserve/release
// pairs) and 'stock_out' (Persiapan Bahan's direct deduction via
// save_material_preparation, or a manual removal via inventory_adjust_stock)
// count as consumption; 'reservation' is just a hold (physical_stock
// untouched, and no longer produced at all) and 'adjustment' is a
// correction, not usage, so both are excluded. All-time, no new table
// or RPC — read-only aggregation over material_stock_movements.
export async function fetchMostUsedMaterials(supabase: SupabaseClient, limit = 5): Promise<MaterialUsageRanking[]> {
  const { data, error } = await supabase
    .from('material_stock_movements')
    .select('material_id, quantity, materials(name, unit, is_active)')
    .in('movement_type', ['release', 'stock_out'])

  if (error) throw error

  const totals = new Map<string, MaterialUsageRanking>()
  for (const row of data ?? []) {
    const material = Array.isArray(row.materials) ? row.materials[0] : row.materials
    if (!material?.is_active) continue
    const materialId = row.material_id as string
    const existing = totals.get(materialId)
    if (existing) {
      existing.totalConsumed += row.quantity
    } else {
      totals.set(materialId, {
        materialId,
        name: material.name,
        unit: material.unit,
        totalConsumed: row.quantity,
      })
    }
  }

  return Array.from(totals.values())
    .sort((a, b) => b.totalConsumed - a.totalConsumed)
    .slice(0, limit)
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
