import type { PriceSnapshotLine } from '@/lib/designSpecification/types'

export type DiscountType = 'percentage' | 'fixed'
export type PaymentType = 'dp' | 'installment' | 'pelunasan' | 'full'
export type PaymentMethod = 'tunai' | 'transfer' | 'qris'

export type PaymentStatus = 'belum_ada_harga' | 'belum_dibayar' | 'dp_diterima' | 'lunas'

export interface OrderPayment {
  id: string
  order_id: string
  quotation_id: string | null
  amount: number
  payment_type: PaymentType
  payment_method: PaymentMethod | null
  notes: string | null
  recorded_by: string | null
  paid_at: string
  created_at: string
}

// Shape returned by get_order_invoice() — the Invoice Foundation.
export interface OrderInvoice {
  order_id: string
  order_number: string
  customer_name: string | null
  has_quotation: boolean
  line_items: PriceSnapshotLine[]
  subtotal: number
  discount_type: DiscountType | null
  discount_value: number
  discount_amount: number
  discount_reason: string | null
  kol_code: string | null
  kol_discount_amount: number
  kol_notes: string | null
  override_amount: number | null
  override_reason: string | null
  override_at: string | null
  total: number
  status: string
  total_paid: number
  balance_due: number
  payment_status: PaymentStatus
  payments: OrderPayment[]
  invoice_notes: string
}

// Commercial Rules — Runtime Configuration read live by the Commercial
// Engine RPCs (apply_order_discount/apply_order_kol/set_order_price_override/
// record_order_payment/recompute_quotation_total/get_order_invoice). See
// supabase/migrations/20260811000000_add_business_rules_runtime_config.sql.
export interface CommercialRules {
  min_dp_percent: number
  max_discount_percent: number
  full_payment_only: boolean
  kol_max_discount_percent: number
  owner_override_enabled: boolean
  invoice_notes: string
  price_rounding_nearest: number
  updated_at: string
  updated_by: string | null
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  dp: 'DP (Uang Muka)',
  installment: 'Cicilan',
  pelunasan: 'Pelunasan',
  full: 'Pembayaran Penuh',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  tunai: 'Tunai',
  transfer: 'Transfer',
  qris: 'QRIS',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  belum_ada_harga: 'Belum Dihitung',
  belum_dibayar: 'Belum Dibayar',
  dp_diterima: 'DP Diterima',
  lunas: 'Lunas',
}
