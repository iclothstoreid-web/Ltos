'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PriceSnapshot } from '@/lib/designSpecification/types'
import { formatRupiah } from '@/lib/format/money'
import { getOrderInvoice, recordOrderPayment, upsertOrderQuotation } from '@/lib/commercial/client'
import { uploadPaymentProof, attachPaymentProof, getPaymentProofSignedUrl } from '@/lib/commercial/paymentProof'
import type { OrderInvoice, PaymentMethod, PaymentType } from '@/lib/commercial/types'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_TYPE_LABELS } from '@/lib/commercial/types'

interface PaymentSummaryCardProps {
  orderId: string
  priceSnapshot: PriceSnapshot | null
}

const METHODS: PaymentMethod[] = ['tunai', 'transfer', 'qris']
// The Fitter only ever records the two the desk actually collects here;
// Cicilan/Pembayaran Penuh stay valid in the RPC for other flows.
const PAYMENT_TYPES: PaymentType[] = ['dp', 'pelunasan', 'installment']

const STATUS_TONE: Record<string, string> = {
  lunas: 'text-[#006c49] bg-[#006c49]/10',
  dp_diterima: 'text-[#8a5a00] bg-[#8a5a00]/10',
  belum_dibayar: 'text-[#ba1a1a] bg-[#ba1a1a]/10',
  belum_ada_harga: 'text-[#444748] bg-[#444748]/10',
  tidak_ada_tagihan: 'text-[#444748] bg-[#444748]/10',
}

// Sprint K Commercial Engine's payment-collection surface — Fase 2 reworks
// the entry UX (TUNAI / TRANSFER / QRIS buttons + DP/Pelunasan + proof
// upload) on top of the already-complete backend: upsert_order_quotation
// persists the computed PriceSnapshot, get_order_invoice returns
// totals/status/history, record_order_payment is idempotent (one intent key
// per form open) and enforces Commercial Rules, attach_payment_proof links
// a Transfer/QRIS receipt after the fact.
export function PaymentSummaryCard({ orderId, priceSnapshot }: PaymentSummaryCardProps) {
  const [supabase] = useState(() => createClient())
  const [invoice, setInvoice] = useState<OrderInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentType>('dp')
  const [notes, setNotes] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  // One idempotency key per payment INTENT (form open), replayed across a
  // double-click / retry / second tab — the RPC returns the same row.
  const [intentKey, setIntentKey] = useState<string | null>(null)

  async function refresh() {
    setInvoice(await getOrderInvoice(supabase, orderId))
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
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
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  function openForm(m: PaymentMethod) {
    if (!invoice) return
    setMethod(m)
    setError(null)
    setIntentKey(crypto.randomUUID())
    setProofFile(null)
    setNotes('')
    // Smart defaults: first payment -> DP; anything after -> Pelunasan for
    // the remaining balance.
    const firstPayment = invoice.total_paid <= 0
    setPaymentType(firstPayment ? 'dp' : 'pelunasan')
    setAmount(firstPayment ? '' : String(Math.max(invoice.balance_due, 0)))
  }

  function closeForm() {
    setMethod(null)
    setIntentKey(null)
    setProofFile(null)
  }

  async function confirmPayment() {
    if (!method || !invoice) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Nominal pembayaran tidak valid.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      // Upload proof first (Transfer/QRIS, optional) so a failed upload
      // stops before any payment is recorded.
      let proofPath: string | null = null
      if (proofFile && method !== 'tunai') {
        proofPath = await uploadPaymentProof(supabase, { orderId, file: proofFile })
      }

      const key = intentKey ?? crypto.randomUUID()
      if (!intentKey) setIntentKey(key)
      const payment = await recordOrderPayment(supabase, {
        orderId,
        amount: value,
        paymentType,
        paymentMethod: method,
        notes: notes.trim() || undefined,
        idempotencyKey: key,
      })

      if (proofPath) {
        try {
          await attachPaymentProof(supabase, payment.id, proofPath)
        } catch (err) {
          // Payment is safe; only the receipt link failed to attach.
          console.error('[order-created] attach proof failed', err)
        }
      }

      await refresh()
      closeForm()
      setAmount('')
    } catch (err) {
      console.error('[order-created] record payment failed', err)
      // Commercial Rules (Minimal DP / Full Payment) reject with a specific,
      // staff-actionable message — surface it verbatim.
      setError(err instanceof Error ? err.message : 'Gagal mencatat pembayaran.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-4">
      <h3 className="font-sans text-xs text-[#444748] uppercase tracking-widest mb-4 border-b border-[#c4c7c7] pb-2">
        Pembayaran
      </h3>

      {loading && <p className="font-sans text-sm text-[#444748]">Memuat...</p>}
      {error && <p className="font-sans text-xs text-[#ba1a1a] mb-3">{error}</p>}

      {!loading && invoice && (
        <>
          {/* ── Total / Dibayar / Sisa / Status ─────────────────────────── */}
          <div className="space-y-1.5 mb-4">
            <Row label="Total Order" value={invoice.has_quotation ? formatRupiah(invoice.total) : 'Belum dihitung'} bold />
            <Row label="Sudah Dibayar" value={formatRupiah(invoice.total_paid)} />
            <Row label="Sisa" value={formatRupiah(invoice.balance_due)} bold />
          </div>
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 mb-4 font-sans text-[10px] uppercase tracking-wider ${
              STATUS_TONE[invoice.payment_status] ?? STATUS_TONE.belum_ada_harga
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {invoice.payment_status === 'lunas' ? 'task_alt' : 'pending'}
            </span>
            {PAYMENT_STATUS_LABELS[invoice.payment_status]}
          </div>

          {invoice.invoice_notes && (
            <p className="font-sans text-[10px] text-[#444748] italic mb-4">{invoice.invoice_notes}</p>
          )}

          {/* ── Payment history ─────────────────────────────────────────── */}
          {invoice.payments.length > 0 && (
            <div className="mb-4 space-y-1.5 border-t border-[#c4c7c7]/30 pt-3">
              <p className="font-sans text-[10px] uppercase text-[#444748]">Riwayat</p>
              {invoice.payments.map((p) => (
                <PaymentRow key={p.id} payment={p} />
              ))}
            </div>
          )}

          {/* ── Collect payment ────────────────────────────────────────── */}
          {invoice.payment_status === 'tidak_ada_tagihan' ? (
            <p className="font-sans text-xs text-[#444748]">Order ini tidak memerlukan pembayaran.</p>
          ) : invoice.payment_status === 'belum_ada_harga' ? (
            <p className="font-sans text-xs text-[#444748]">Harga belum tersedia — pembayaran belum bisa dicatat.</p>
          ) : invoice.balance_due <= 0 ? (
            <p className="font-sans text-xs text-[#006c49]">Pembayaran lunas.</p>
          ) : !method ? (
            <div>
              <p className="font-sans text-[10px] uppercase text-[#444748] mb-2">Catat Pembayaran</p>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => openForm(m)}
                    className="py-2.5 border border-[#151c27] text-[#151c27] font-sans text-[11px] uppercase tracking-wider hover:bg-[#151c27] hover:text-white transition-colors"
                  >
                    {PAYMENT_METHOD_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 border-t border-[#c4c7c7]/30 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-semibold text-[#151c27]">
                  Metode: {PAYMENT_METHOD_LABELS[method]}
                </span>
                <button type="button" onClick={closeForm} className="material-symbols-outlined text-[16px] text-[#444748]">
                  close
                </button>
              </div>

              <label className="block">
                <span className="font-sans text-[10px] uppercase text-[#444748]">Jenis</span>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className="mt-1 w-full py-2 px-2 border border-[#c4c7c7] text-xs outline-none focus:border-[#775a19]"
                >
                  {PAYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {PAYMENT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="font-sans text-[10px] uppercase text-[#444748]">Nominal (Rp)</span>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Sisa: ${formatRupiah(invoice.balance_due)}`}
                  className="mt-1 w-full py-2 px-2 border border-[#c4c7c7] text-sm outline-none focus:border-[#775a19]"
                />
              </label>

              <label className="block">
                <span className="font-sans text-[10px] uppercase text-[#444748]">Catatan (opsional)</span>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full py-2 px-2 border border-[#c4c7c7] text-sm outline-none focus:border-[#775a19]"
                />
              </label>

              {method !== 'tunai' && (
                <div>
                  <span className="font-sans text-[10px] uppercase text-[#444748]">Bukti Pembayaran (opsional)</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-1 w-full py-2 border border-dashed border-[#747878] font-sans text-xs text-[#444748] hover:border-[#775a19] transition-colors truncate"
                  >
                    {proofFile ? proofFile.name : 'Pilih file (JPG / PNG / PDF)'}
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={confirmPayment}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#151c27] text-white font-sans text-[11px] uppercase tracking-widest hover:bg-[#775a19] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Konfirmasi Pembayaran'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between font-sans text-xs">
      <span className="text-[#444748]">{label}</span>
      <span className={bold ? 'text-[#151c27] font-semibold' : 'text-[#151c27]'}>{value}</span>
    </div>
  )
}

function PaymentRow({ payment }: { payment: OrderInvoice['payments'][number] }) {
  const [busy, setBusy] = useState(false)
  async function viewProof() {
    if (!payment.payment_proof_path) return
    setBusy(true)
    const url = await getPaymentProofSignedUrl(payment.payment_proof_path)
    setBusy(false)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }
  return (
    <div className="flex items-center justify-between gap-2 font-sans text-xs">
      <span className="text-[#444748] truncate">
        {PAYMENT_TYPE_LABELS[payment.payment_type]}
        {payment.payment_method ? ` · ${PAYMENT_METHOD_LABELS[payment.payment_method]}` : ''}
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {payment.payment_proof_path && (
          <button
            type="button"
            onClick={viewProof}
            disabled={busy}
            className="text-[10px] uppercase tracking-wider text-[#775a19] hover:underline disabled:opacity-50"
          >
            {busy ? '...' : 'Bukti'}
          </button>
        )}
        <span className="text-[#151c27]">{formatRupiah(payment.amount)}</span>
      </span>
    </div>
  )
}
