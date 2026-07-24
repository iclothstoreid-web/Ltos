import type { SupabaseClient } from '@supabase/supabase-js'
import type { PriceSnapshot } from '@/lib/designSpecification/types'
import type { DiscountType, OrderInvoice, OrderPayment, PaymentMethod, PaymentType } from './types'

// Thin wrappers around the Commercial Engine RPC surface — see
// supabase/migrations/20260804000002_add_commercial_engine.sql. Pricing
// math itself stays entirely in buildDesignSpecification() (never
// duplicated here); this module only persists that already-computed
// PriceSnapshot and layers discount/KOL/override/payments on top of it.

export async function upsertOrderQuotation(
  supabase: SupabaseClient,
  orderId: string,
  snapshot: PriceSnapshot
): Promise<void> {
  const { error } = await supabase.rpc('upsert_order_quotation', {
    p_order_id: orderId,
    p_line_items: snapshot.lines,
    p_subtotal: snapshot.total,
  })
  if (error) throw error
}

export async function applyOrderDiscount(
  supabase: SupabaseClient,
  orderId: string,
  discountType: DiscountType,
  discountValue: number,
  reason: string
): Promise<void> {
  const { error } = await supabase.rpc('apply_order_discount', {
    p_order_id: orderId,
    p_discount_type: discountType,
    p_discount_value: discountValue,
    p_reason: reason || null,
  })
  if (error) throw error
}

export async function applyOrderKol(
  supabase: SupabaseClient,
  orderId: string,
  kolCode: string,
  kolDiscountAmount: number,
  notes: string
): Promise<void> {
  const { error } = await supabase.rpc('apply_order_kol', {
    p_order_id: orderId,
    p_kol_code: kolCode,
    p_kol_discount_amount: kolDiscountAmount,
    p_notes: notes || null,
  })
  if (error) throw error
}

export async function setOrderPriceOverride(
  supabase: SupabaseClient,
  orderId: string,
  overrideAmount: number,
  reason: string
): Promise<void> {
  const { error } = await supabase.rpc('set_order_price_override', {
    p_order_id: orderId,
    p_override_amount: overrideAmount,
    p_reason: reason,
  })
  if (error) throw error
}

export async function clearOrderPriceOverride(supabase: SupabaseClient, orderId: string): Promise<void> {
  const { error } = await supabase.rpc('clear_order_price_override', { p_order_id: orderId })
  if (error) throw error
}

export async function recordOrderPayment(
  supabase: SupabaseClient,
  params: {
    orderId: string
    amount: number
    paymentType: PaymentType
    paymentMethod: PaymentMethod
    notes?: string
  }
): Promise<OrderPayment> {
  const { data, error } = await supabase.rpc('record_order_payment', {
    p_order_id: params.orderId,
    p_amount: params.amount,
    p_payment_type: params.paymentType,
    p_payment_method: params.paymentMethod,
    p_notes: params.notes || null,
  })
  if (error) throw error
  return data as OrderPayment
}

export async function getOrderInvoice(supabase: SupabaseClient, orderId: string): Promise<OrderInvoice> {
  const { data, error } = await supabase.rpc('get_order_invoice', { p_order_id: orderId })
  if (error) throw error
  return data as OrderInvoice
}
