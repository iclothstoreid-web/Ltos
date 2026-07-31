// Inventory App — single source of truth for material stock. Mirrors the
// shape of src/lib/design/masterData.ts's MasterDataOption, since both are
// "one row per catalog item" tables with photo/name/price plus a few
// domain-specific fields.

export interface MaterialCategory {
  id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Material {
  id: string
  category_id: string
  name: string
  sku: string | null
  unit: string
  price: number
  physical_stock: number
  reserved_stock: number
  available_stock: number
  min_stock: number
  photo_url: string | null
  location: string | null
  is_active: boolean
  // Material Master identity fields (Sprint K LOCK V1 §6-7) — no stock
  // meaning, purely descriptive. Color is never a field on Material itself —
  // it lives in material_colors (Architecture Lock: DNA Color Repository +
  // Material Color Mapping).
  supplier: string | null
  created_at: string
  updated_at: string
  // Joined
  material_categories?: MaterialCategory
}

export type StockStatus = 'aman' | 'menipis' | 'habis'

export function materialStockStatus(material: Pick<Material, 'available_stock' | 'min_stock'>): StockStatus {
  if (material.available_stock <= 0) return 'habis'
  if (material.available_stock <= material.min_stock) return 'menipis'
  return 'aman'
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  aman: 'Aman',
  menipis: 'Menipis',
  habis: 'Stok Habis',
}

export type MovementType = 'stock_in' | 'stock_out' | 'reservation' | 'release' | 'adjustment'

export interface StockMovement {
  id: string
  material_id: string
  movement_type: MovementType
  quantity: number
  order_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  // Joined
  profiles?: { name: string } | null
}

// Sprint I.2 Material Usage Intelligence — reservation/release status for one
// order-material pair, netted from material_stock_movements. 'reserved' =
// only reservation movements exist yet (still held, not released to
// production); 'released' = fully released (>= reserved qty released);
// 'partial' = some released, some still held.
export type MaterialUsageStatus = 'reserved' | 'partial' | 'released'

// Material Detail -> "order apa saja pakai material ini". Supersedes the old
// MaterialUsage (which only showed currently-active net>0 reservations) with
// full history + status + totals, per Sprint I.2.
export interface MaterialOrderUsage {
  orderId: string
  orderNumber: string
  customerName: string
  currentState: string
  reservedQty: number
  releasedQty: number
  netQty: number
  status: MaterialUsageStatus
}

// Order Detail -> "material apa saja dipakai order ini". Mirror of
// MaterialOrderUsage for the reverse direction.
export interface OrderMaterialUsage {
  materialId: string
  name: string
  unit: string
  reservedQty: number
  releasedQty: number
  netQty: number
  status: MaterialUsageStatus
}

// Material Intelligence (Sprint I.1) — "perlu perhatian" list. Same
// ratio/reorder-qty shape Command Center's page.tsx composes inline for the
// Inventory Alert Decision Card, extracted so both can share one definition.
export interface MaterialAttentionItem {
  materialId: string
  name: string
  unit: string
  availableStock: number
  minStock: number
  status: StockStatus
  reorderQty: number
}

// "Material paling banyak dipakai" — ranked by total quantity physically
// consumed (release + stock_out movements), all-time.
export interface MaterialUsageRanking {
  materialId: string
  name: string
  unit: string
  totalConsumed: number
}

export const MOVEMENT_TYPE_LABEL: Record<MovementType, string> = {
  stock_in: 'Stock Masuk',
  stock_out: 'Stock Keluar',
  reservation: 'Reservation',
  release: 'Release',
  adjustment: 'Adjustment',
}

// Estimasi Biaya (Drawer tab) — one row of the material list. Deliberately
// holds only refs + qty, never price/unit: those always come from a live
// join against the current `materials` list at render time, so "Harga
// Material selalu berasal dari Inventory" can never go stale even for a
// template saved months ago.
export interface MaterialEstimateRow {
  id: string
  categoryId: string
  materialId: string
  quantity: number
}

export interface AdditionalCostRow {
  id: string
  name: string
  nominal: number
  notes: string
}

export interface MaterialEstimateTemplate {
  id: string
  name: string
  materialRows: MaterialEstimateRow[]
  additionalCosts: AdditionalCostRow[]
  hargaJual: number | null
  catatan: string
  created_at: string
}
