'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PriceSnapshot } from '@/lib/designSpecification/types'
import { formatRupiah } from '@/lib/format/money'
import { getOrderInvoice, recordOrderPayment, upsertOrderQuotation } from '@/lib/commercial/client'
import type { OrderInvoice, PaymentMethod, PaymentType } from '@/lib/commercial/types'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_TYPE_LABELS } from '@/lib/commercial/types'

interface PaymentSummaryCardProps {
  orderId: string
  priceSnapshot: PriceSnapshot | null
}

// Sprint K Commercial Engine's first real payment-collection surface. On
// mount, persists the already-computed PriceSnapshot as this Order's
// quotation (1:1, upsert) — the pricing math itself still lives only in
// buildDesignSpecification(), never recomputed here. Then reads
// get_order_invoice() (the Invoice Foundation) for totals/payment history,
// and lets front-desk staff record a DP/Full/Cicilan payment. Discount/KOL/
// Owner Override stay Owner OS-only (see OrderDetailModal's Komersial
// section) — this Fitter-facing card only ever displays them read-only.
export function PaymentSummaryCard({ orderId, priceSnapshot }: PaymentSummaryCardProps) {
  const [supabase] = useState(() => createClient())
  const [invoice, setInvoice] = useState<OrderInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentType>('dp')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (priceSnapshot && priceSnapshot.lines.length > 0) {
          await upsertOrderQuotation(supabase, orderId, priceSnapshot)
        }
        const result = await getOrderInvoice(supabase, orderId)
        if (!cancelled) setInvoice(result)
      } catch (err) {
        console.error('[order-created] load invoice failed', err)
        if (!cancelled) setError('Gagal memuat data harga.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  async function handleRecordPayment() {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Jumlah pembayaran tidak valid.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await recordOrderPayment(supabase, { orderId, amount: value, paymentType, paymentMethod })
      setInvoice(await getOrderInvoice(supabase, orderId))
      setAmount('')
      setShowForm(false)
    } catch (err) {
      console.error('[order-created] record payment failed', err)
      // Commercial Rules (Minimal DP / Full Payment) reject with a specific,
      // staff-actionable message — surface it instead of a generic failure.
      const message = err instanceof Error ? err.message : null
      setError(message || 'Gagal mencatat pembayaran.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-4">
      <h3 className="font-sans text-xs text-[#444748] uppercase tracking-widest mb-4 border-b border-[#c4c7c7] pb-2">
        Ringkasan Pembayaran
      </h3>

      {loading && <p className="font-sans text-sm text-[#444748]">Memuat...</p>}
      {error && <p className="font-sans text-xs text-[#ba1a1a] mb-3">{error}</p>}

      {!loading && invoice && (
        <>
          <div className="space-y-3 mb-6">
            {invoice.line_items.length === 0 ? (
              <div className="flex justify-between font-sans text-sm">
                <span className="text-[#444748]">Subtotal</span>
                <span className="text-[#151c27]">Belum dihitung</span>
              </div>
            ) : (
              invoice.line_items.map(line => (
                <div key={line.optionId} className="flex justify-between font-sans text-sm">
                  <span className="text-[#444748]">{line.optionName}</span>
                  <span className="text-[#151c27]">{formatRupiah(line.subtotal)}</span>
                </div>
              ))
            )}
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between font-sans text-sm">
                <span className="text-[#444748]">Diskon</span>
                <span className="text-[#151c27]">-{formatRupiah(invoice.discount_amount)}</span>
              </div>
            )}
            {invoice.kol_discount_amount > 0 && (
              <div className="flex justify-between font-sans text-sm">
                <span className="text-[#444748]">Diskon KOL{invoice.kol_code ? ` (${invoice.kol_code})` : ''}</span>
                <span className="text-[#151c27]">-{formatRupiah(invoice.kol_discount_amount)}</span>
              </div>
            )}
            {invoice.override_amount != null && (
              <div className="flex justify-between font-sans text-sm">
                <span className="text-[#444748]">Override Harga</span>
                <span className="text-[#151c27]">{formatRupiah(invoice.override_amount)}</span>
              </div>
            )}
            <div className="h-[0.5px] bg-[#747878] border-dashed border-t-[0.5px]" />
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-sans text-xs font-bold text-[#151c27]">TOTAL KESELURUHAN</span>
              <span className="font-fraunces text-lg text-[#151c27]">{formatRupiah(invoice.total)}</span>
            </div>
            <div className="flex justify-between font-sans text-xs">
              <span className="text-[#444748]">Sudah Dibayar</span>
              <span className="text-[#151c27]">{formatRupiah(invoice.total_paid)}</span>
            </div>
            <div className="flex justify-between font-sans text-xs">
              <span className="text-[#444748]">Sisa Tagihan</span>
              <span className="text-[#151c27] font-semibold">{formatRupiah(invoice.balance_due)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-[#775a19]">
              {invoice.payment_status === 'lunas' ? 'task_alt' : 'pending'}
            </span>
            <span className="font-sans text-xs uppercase text-[#775a19]">
              Status: {PAYMENT_STATUS_LABELS[invoice.payment_status]}
            </span>
          </div>

          {invoice.invoice_notes && (
            <p className="font-sans text-[10px] text-[#444748] italic mb-4">{invoice.invoice_notes}</p>
          )}

          {invoice.payments.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="font-sans text-[10px] uppercase text-[#444748]">Riwayat Pembayaran</p>
              {invoice.payments.map(p => (
                <div key={p.id} className="flex justify-between font-sans text-xs">
                  <span className="text-[#444748]">
                    {PAYMENT_TYPE_LABELS[p.payment_type]}
                    {p.payment_method ? ` · ${PAYMENT_METHOD_LABELS[p.payment_method]}` : ''}
                  </span>
                  <span className="text-[#151c27]">{formatRupiah(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {invoice.balance_due > 0 && !showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full py-2 bg-[#151c27] text-white text-[10px] uppercase tracking-widest hover:bg-[#775a19] transition-colors"
            >
              Catat Pembayaran
            </button>
          )}

          {showForm && (
            <div className="space-y-2 pt-2 border-t border-[#c4c7c7]/30">
              <input
                type="number"
                min={1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Jumlah (Rp)"
                className="w-full py-2 px-2 border border-[#c4c7c7] text-sm outline-none focus:border-[#775a19]"
              />
              <div className="flex gap-2">
                <select
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value as PaymentType)}
                  className="flex-1 py-2 px-2 border border-[#c4c7c7] text-xs outline-none"
                >
                  {(Object.keys(PAYMENT_TYPE_LABELS) as PaymentType[]).map(t => (
                    <option key={t} value={t}>
                      {PAYMENT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="flex-1 py-2 px-2 border border-[#c4c7c7] text-xs outline-none"
                >
                  {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(m => (
                    <option key={m} value={m}>
                      {PAYMENT_METHOD_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRecordPayment}
                  disabled={saving}
                  className="flex-1 py-2 bg-[#151c27] text-white text-[10px] uppercase tracking-widest hover:bg-[#775a19] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border border-[#747878] text-[10px] uppercase tracking-widest"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
