import type { SupabaseClient } from '@supabase/supabase-js'
import { getCommercialRules } from './client'
import type { PaymentStatus } from './types'

export interface OutstandingPaymentRow {
  orderId: string
  orderNumber: string
  customerName: string
  outstandingAmount: number
  paymentStatus: PaymentStatus
}

export interface CommercialSummary {
  sales: number
  cashCollected: number
  outstandingPayment: number
  dpOutstandingCount: number
  minDpPercent: number
  fullPaymentOnly: boolean
  outstandingRows: OutstandingPaymentRow[]
}

type QuotationRow = {
  id: string
  order_id: string
  total: number | null
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
        .select('id, order_id, total, orders!inner(order_number, customers(name))')
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

  for (const quotation of (quotations || []) as QuotationRow[]) {
    const total = Number(quotation.total || 0)
    const paid = paidByQuotationId.get(quotation.id) || 0
    const outstanding = Math.max(total - paid, 0)
    const order = first(quotation.orders)
    const customer = first(order?.customers || null)
    const requiredPayment = rules.full_payment_only ? total : total * (Number(rules.min_dp_percent) / 100)

    sales += total
    cashCollected += paid
    outstandingPayment += outstanding
    if (requiredPayment > 0 && paid < requiredPayment) dpOutstandingCount += 1

    if (outstanding > 0) {
      outstandingRows.push({
        orderId: quotation.order_id,
        orderNumber: order?.order_number || 'Order',
        customerName: customer?.name || 'Customer',
        outstandingAmount: outstanding,
        paymentStatus: getPaymentStatus(total, paid),
      })
    }
  }

  outstandingRows.sort((a, b) => b.outstandingAmount - a.outstandingAmount)

  return {
    sales,
    cashCollected,
    outstandingPayment,
    dpOutstandingCount,
    minDpPercent: Number(rules.min_dp_percent),
    fullPaymentOnly: rules.full_payment_only,
    outstandingRows,
  }
}
