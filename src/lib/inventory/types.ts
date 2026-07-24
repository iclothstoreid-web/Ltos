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
  // meaning, purely descriptive.
  supplier: string | null
  default_color: string | null
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

export interface MaterialUsage {
  orderId: string
  orderNumber: string
  customerName: string
  quantity: number
  currentState: string
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
