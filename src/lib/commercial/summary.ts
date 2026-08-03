import type { SupabaseClient } from '@supabase/supabase-js'
import { getCommercialRules } from './client'
import type { PaymentStatus } from './types'

export interface OutstandingPaymentRow {
  orderId: string
  orderNumber: string
  customerName: string
  outstandingAmount: number
  paymentStatus: PaymentStatus
  // Sprint N.1 item 4 (Owner Intelligence) -- Payment Aging. quotations.created_at
  // already existed (the query below already ordered by it); just now selected
  // so callers can bucket "how long has this been outstanding" client-side.
  createdAt: string
}

// Sprint N.2 Task 2 (Commercial Decision) -- same row shape reused for both
// abnormal-discount and abnormal-override rows, just with `amount`/`reason`
// meaning different things per caller (discount % over the rules ceiling,
// or the free-text override reason recorded by set_order_price_override()).
export interface AbnormalCommercialRow {
  orderId: string
  orderNumber: string
  customerName: string
  amount: number
  reason: string
}

export interface CommercialSummary {
  sales: number
  cashCollected: number
  outstandingPayment: number
  dpOutstandingCount: number
  minDpPercent: number
  fullPaymentOnly: boolean
  outstandingRows: OutstandingPaymentRow[]
  highDiscountRows: AbnormalCommercialRow[]
  highOverrideRows: AbnormalCommercialRow[]
}

type QuotationRow = {
  id: string
  order_id: string
  created_at: string
  total: number | null
  subtotal: number | null
  discount_amount: number | null
  override_amount: number | null
  override_reason: string | null
  orders: {
    order_number: string
    customers: { name: string | null } | Array<{ name: string | null }> | null
  } | Array<{
    order_number: string
    customers: { name: string | null } | Array<{ name: string | null }> | null
  }> | null
}

type PaymentRow = {
  quotation_id: string | null
  amount: number | null
}

function first<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value
}

function getPaymentStatus(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return 'belum_dibayar'
  return paid < total ? 'dp_diterima' : 'lunas'
}

// Sprint K Commercial Engine's Sales/Cash Collected/Outstanding/DP
// Outstanding computation -- extracted from what was previously inline in
// the Commercial Center page so the Owner Dashboard's Commercial pillar can
// show the same four numbers without a second, drifting copy of this loop.
// Still no new RPC/table -- same quotations + order_payments + Commercial
// Rules read as before, only moved to a shared place.
export async function getCommercialSummary(supabase: SupabaseClient): Promise<CommercialSummary> {
  const [{ data: quotations, error: quotationsError }, { data: payments, error: paymentsError }, rules] =
    await Promise.all([
      supabase
        .from('quotations')
        .select(
          'id, order_id, created_at, total, subtotal, discount_amount, override_amount, override_reason, orders!inner(order_number, customers(name))'
        )
        // Milestone A (Commercial Type Engine): 'not_billable' quotations
        // (KOL/Sponsor/Warranty/Internal Sample — see
        // supabase/migrations/20260820000000) never get paid by design
        // (record_order_payment rejects them), so without this exclusion
        // every one of them would show up here as Outstanding Payment / DP
        // Outstanding, which is wrong — they were never meant to be billed.
        .neq('status', 'not_billable')
        .order('created_at', { ascending: false }),
      supabase.from('order_payments').select('quotation_id, amount'),
      getCommercialRules(supabase),
    ])

  if (quotationsError) throw quotationsError
  if (paymentsError) throw paymentsError

  const paidByQuotationId = new Map<string, number>()
  for (const payment of (payments || []) as PaymentRow[]) {
    if (!payment.quotation_id) continue
    paidByQuotationId.set(
      payment.quotation_id,
      (paidByQuotationId.get(payment.quotation_id) || 0) + Number(payment.amount || 0)
    )
  }

  let sales = 0
  let cashCollected = 0
  let outstandingPayment = 0
  let dpOutstandingCount = 0
  const outstandingRows: OutstandingPaymentRow[] = []
  const highDiscountRows: AbnormalCommercialRow[] = []
  const highOverrideRows: AbnormalCommercialRow[] = []
  const maxDiscountPercent = Number(rules.max_discount_percent)

  for (const quotation of (quotations || []) as QuotationRow[]) {
    const total = Number(quotation.total || 0)
    const paid = paidByQuotationId.get(quotation.id) || 0
    const outstanding = Math.max(total - paid, 0)
    const order = first(quotation.orders)
    const customer = first(order?.customers || null)
    const requiredPayment = rules.full_payment_only ? total : total * (Number(rules.min_dp_percent) / 100)
    const orderId = quotation.order_id
    const orderNumber = order?.order_number || 'Order'
    const customerName = customer?.name || 'Customer'

    sales += total
    cashCollected += paid
    outstandingPayment += outstanding
    if (requiredPayment > 0 && paid < requiredPayment) dpOutstandingCount += 1

    if (outstanding > 0) {
      outstandingRows.push({
        orderId,
        orderNumber,
        customerName,
        outstandingAmount: outstanding,
        paymentStatus: getPaymentStatus(total, paid),
        createdAt: quotation.created_at,
      })
    }

    // Discount is "abnormal" relative to Commercial Rules' own ceiling
    // (max_discount_percent) -- normalized to % of subtotal so it applies
    // the same way regardless of discount_type (percentage or fixed).
    const subtotal = Number(quotation.subtotal || 0)
    const discountAmount = Number(quotation.discount_amount || 0)
    if (subtotal > 0 && discountAmount > 0) {
      const discountPct = (discountAmount / subtotal) * 100
      if (discountPct > maxDiscountPercent) {
        highDiscountRows.push({
          orderId,
          orderNumber,
          customerName,
          amount: discountAmount,
          reason: `Diskon ${discountPct.toFixed(1)}% (batas ${maxDiscountPercent}%)`,
        })
      }
    }

    if (quotation.override_amount != null) {
      highOverrideRows.push({
        orderId,
        orderNumber,
        customerName,
        amount: Number(quotation.override_amount),
        reason: quotation.override_reason || 'Tanpa alasan tercatat',
      })
    }
  }

  outstandingRows.sort((a, b) => b.outstandingAmount - a.outstandingAmount)
  highDiscountRows.sort((a, b) => b.amount - a.amount)

  return {
    sales,
    cashCollected,
    outstandingPayment,
    dpOutstandingCount,
    minDpPercent: Number(rules.min_dp_percent),
    fullPaymentOnly: rules.full_payment_only,
    outstandingRows,
    highDiscountRows,
    highOverrideRows,
  }
}
