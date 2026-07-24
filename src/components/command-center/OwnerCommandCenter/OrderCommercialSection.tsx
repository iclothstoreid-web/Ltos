'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/format/money'
import {
  applyOrderDiscount,
  applyOrderKol,
  clearOrderPriceOverride,
  getOrderInvoice,
  setOrderPriceOverride,
} from '@/lib/commercial/client'
import type { DiscountType, OrderInvoice } from '@/lib/commercial/types'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_TYPE_LABELS } from '@/lib/commercial/types'

interface OrderCommercialSectionProps {
  orderId: string
}

// Owner OS-only ("Owner Override"/"Discount"/"KOL" are owner/admin-gated at
// the RPC level, see supabase/migrations/20260804000002) section inside
// OrderDetailModal — everything a Fitter can already see on
// PaymentSummaryCard, plus the controls only an owner should have.
export function OrderCommercialSection({ orderId }: OrderCommercialSectionProps) {
  const [supabase] = useState(() => createClient())
  const [invoice, setInvoice] = useState<OrderInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [discountType, setDiscountType] = useState<DiscountType>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [discountReason, setDiscountReason] = useState('')

  const [kolCode, setKolCode] = useState('')
  const [kolAmount, setKolAmount] = useState('')

  const [overrideAmount, setOverrideAmount] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  // Commercial Rules (Maksimal Diskon/KOL, Owner Override kill switch)
  // reject with a specific, actionable message — surface it instead of a
  // generic failure so the owner knows which rule blocked them.
  function errorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback
  }

  async function refresh() {
    try {
      setInvoice(await getOrderInvoice(supabase, orderId))
    } catch (err) {
      console.error('[command-center] load invoice failed', err)
      setError('Gagal memuat data komersial.')
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getOrderInvoice(supabase, orderId)
        if (!cancelled) setInvoice(result)
      } catch (err) {
        console.error('[command-center] load invoice failed', err)
        if (!cancelled) setError('Gagal memuat data komersial.')
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

  async function handleApplyDiscount() {
    const value = Number(discountValue)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Nilai diskon tidak valid.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await applyOrderDiscount(supabase, orderId, discountType, value, discountReason)
      setDiscountValue('')
      setDiscountReason('')
      await refresh()
    } catch (err) {
      console.error('[command-center] apply discount failed', err)
      setError(errorMessage(err, 'Gagal menerapkan diskon.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleApplyKol() {
    const value = Number(kolAmount)
    if (!kolCode.trim() || !Number.isFinite(value) || value <= 0) {
      setError('Kode KOL dan nominal diskon wajib diisi.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await applyOrderKol(supabase, orderId, kolCode.trim(), value, '')
      setKolCode('')
      setKolAmount('')
      await refresh()
    } catch (err) {
      console.error('[command-center] apply KOL failed', err)
      setError(errorMessage(err, 'Gagal menerapkan diskon KOL.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleSetOverride() {
    const value = Number(overrideAmount)
    if (!Number.isFinite(value) || value < 0 || !overrideReason.trim()) {
      setError('Nominal dan alasan override wajib diisi.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await setOrderPriceOverride(supabase, orderId, value, overrideReason)
      setOverrideAmount('')
      setOverrideReason('')
      await refresh()
    } catch (err) {
      console.error('[command-center] set override failed', err)
      setError(errorMessage(err, 'Gagal melakukan override harga.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleClearOverride() {
    setSaving(true)
    setError(null)
    try {
      await clearOrderPriceOverride(supabase, orderId)
      await refresh()
    } catch (err) {
      console.error('[command-center] clear override failed', err)
      setError('Gagal membatalkan override.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="font-hanken text-xs text-[#46464c]">Memuat data komersial...</p>
  if (!invoice) return null

  return (
    <div>
      <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Komersial</p>
      {error && <p className="font-hanken text-xs text-[#c0392b] mb-2">{error}</p>}

      {!invoice.has_quotation ? (
        <p className="font-hanken text-xs text-[#46464c]">
          Belum ada data harga — Order ini belum pernah dibuka di layar Order Created.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 font-hanken text-xs mb-4">
            <span className="text-[#46464c]">Subtotal</span>
            <span className="text-right text-[#161b29]">{formatRupiah(invoice.subtotal)}</span>
            {invoice.discount_amount > 0 && (
              <>
                <span className="text-[#46464c]">Diskon {invoice.discount_reason ? `(${invoice.discount_reason})` : ''}</span>
                <span className="text-right text-[#161b29]">-{formatRupiah(invoice.discount_amount)}</span>
              </>
            )}
            {invoice.kol_discount_amount > 0 && (
              <>
                <span className="text-[#46464c]">KOL {invoice.kol_code ? `(${invoice.kol_code})` : ''}</span>
                <span className="text-right text-[#161b29]">-{formatRupiah(invoice.kol_discount_amount)}</span>
              </>
            )}
            {invoice.override_amount != null && (
              <>
                <span className="text-[#46464c]">Override ({invoice.override_reason})</span>
                <span className="text-right text-[#161b29]">{formatRupiah(invoice.override_amount)}</span>
              </>
            )}
            <span className="font-semibold text-[#161b29]">Total</span>
            <span className="text-right font-semibold text-[#161b29]">{formatRupiah(invoice.total)}</span>
            <span className="text-[#46464c]">Dibayar</span>
            <span className="text-right text-[#161b29]">{formatRupiah(invoice.total_paid)}</span>
            <span className="text-[#46464c]">Sisa</span>
            <span className="text-right text-[#161b29]">{formatRupiah(invoice.balance_due)}</span>
            <span className="text-[#46464c]">Status</span>
            <span className="text-right text-[#161b29]">{PAYMENT_STATUS_LABELS[invoice.payment_status]}</span>
          </div>

          {invoice.invoice_notes && (
            <p className="font-hanken text-[10px] text-[#46464c] italic mb-4">{invoice.invoice_notes}</p>
          )}

          {invoice.payments.length > 0 && (
            <div className="mb-4 space-y-1">
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Riwayat Pembayaran</p>
              {invoice.payments.map(p => (
                <div key={p.id} className="flex justify-between font-hanken text-xs">
                  <span className="text-[#46464c]">
                    {PAYMENT_TYPE_LABELS[p.payment_type]}
                    {p.payment_method ? ` · ${PAYMENT_METHOD_LABELS[p.payment_method]}` : ''}
                  </span>
                  <span className="text-[#161b29]">{formatRupiah(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="border-t border-[#e5e5e0] pt-3">
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Diskon</p>
              <div className="flex flex-wrap gap-2">
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as DiscountType)}
                  className="py-1.5 px-2 border border-[#c4c7c7] text-xs"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">Rp</option>
                </select>
                <input
                  type="number"
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  placeholder="Nilai"
                  className="w-24 py-1.5 px-2 border border-[#c4c7c7] text-xs"
                />
                <input
                  type="text"
                  value={discountReason}
                  onChange={e => setDiscountReason(e.target.value)}
                  placeholder="Alasan"
                  className="flex-1 min-w-[120px] py-1.5 px-2 border border-[#c4c7c7] text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={saving}
                  className="py-1.5 px-3 bg-[#161b29] text-white text-xs uppercase tracking-widest disabled:opacity-40"
                >
                  Terapkan
                </button>
              </div>
            </div>

            <div className="border-t border-[#e5e5e0] pt-3">
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">KOL</p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={kolCode}
                  onChange={e => setKolCode(e.target.value)}
                  placeholder="Kode KOL"
                  className="w-28 py-1.5 px-2 border border-[#c4c7c7] text-xs"
                />
                <input
                  type="number"
                  value={kolAmount}
                  onChange={e => setKolAmount(e.target.value)}
                  placeholder="Diskon (Rp)"
                  className="w-28 py-1.5 px-2 border border-[#c4c7c7] text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyKol}
                  disabled={saving}
                  className="py-1.5 px-3 bg-[#161b29] text-white text-xs uppercase tracking-widest disabled:opacity-40"
                >
                  Terapkan
                </button>
              </div>
            </div>

            <div className="border-t border-[#e5e5e0] pt-3">
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Owner Override</p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  value={overrideAmount}
                  onChange={e => setOverrideAmount(e.target.value)}
                  placeholder="Total baru (Rp)"
                  className="w-32 py-1.5 px-2 border border-[#c4c7c7] text-xs"
                />
                <input
                  type="text"
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  placeholder="Alasan (wajib)"
                  className="flex-1 min-w-[120px] py-1.5 px-2 border border-[#c4c7c7] text-xs"
                />
                <button
                  type="button"
                  onClick={handleSetOverride}
                  disabled={saving}
                  className="py-1.5 px-3 bg-[#161b29] text-white text-xs uppercase tracking-widest disabled:opacity-40"
                >
                  Set Override
                </button>
                {invoice.override_amount != null && (
                  <button
                    type="button"
                    onClick={handleClearOverride}
                    disabled={saving}
                    className="py-1.5 px-3 border border-[#c4c7c7] text-xs uppercase tracking-widest disabled:opacity-40"
                  >
                    Batalkan Override
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
