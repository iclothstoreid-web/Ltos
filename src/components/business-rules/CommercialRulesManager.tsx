'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCommercialRules, setCommercialRules } from '@/lib/commercial/client'
import type { CommercialRules } from '@/lib/commercial/types'

interface CommercialRulesManagerProps {
  initialRules: CommercialRules
}

// Runtime Configuration for the Commercial Engine (UX Cleanup sprint) — every
// field here is read live by apply_order_discount/apply_order_kol/
// set_order_price_override/record_order_payment/recompute_quotation_total/
// get_order_invoice (supabase/migrations/20260811000000_add_business_rules_runtime_config.sql).
// Saving here changes engine behavior immediately, no deploy.
export function CommercialRulesManager({ initialRules }: CommercialRulesManagerProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [rules, setRules] = useState(initialRules)
  const [draft, setDraft] = useState(initialRules)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const dirty = JSON.stringify(draft) !== JSON.stringify(rules)

  async function handleSave() {
    if (
      draft.min_dp_percent < 0 || draft.min_dp_percent > 100 ||
      draft.max_discount_percent < 0 || draft.max_discount_percent > 100 ||
      draft.kol_max_discount_percent < 0 || draft.kol_max_discount_percent > 100
    ) {
      setError('Persentase harus antara 0-100.')
      return
    }
    if (draft.price_rounding_nearest < 0) {
      setError('Pembulatan Harga tidak boleh negatif.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await setCommercialRules(supabase, draft)
      setRules(updated)
      setDraft(updated)
      setSaved(true)
    } catch (err) {
      console.error('[commercial-rules] save failed', err)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan Commercial Rules.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setSaving(true)
    setError(null)
    try {
      const latest = await getCommercialRules(supabase)
      setRules(latest)
      setDraft(latest)
    } catch (err) {
      console.error('[commercial-rules] reload failed', err)
      setError('Gagal memuat ulang Commercial Rules.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Commercial Rules</h1>
          <p className="text-xs text-[#444748]">Runtime Configuration — dibaca langsung oleh Commercial Engine, tanpa deploy</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/owner/business-rules')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-8 max-w-2xl mx-auto space-y-6">
        {error && (
          <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded text-sm text-[#ba1a1a]">
            {error}
          </div>
        )}
        {saved && !dirty && (
          <div className="p-3 bg-[#dff2df] border border-[#1f6b2c]/30 rounded text-sm text-[#1f6b2c]">
            Tersimpan — Commercial Engine langsung memakai parameter baru.
          </div>
        )}

        <section className="bg-white border-[0.5px] border-[#c4c7c7] p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Minimal DP (%)</label>
            <p className="text-xs text-[#444748] mb-2">
              Pembayaran DP di bawah persentase ini ditolak oleh record_order_payment. 0 = tidak ada minimum.
            </p>
            <input
              type="number"
              min={0}
              max={100}
              value={draft.min_dp_percent}
              onChange={e => setDraft(d => ({ ...d, min_dp_percent: Number(e.target.value) }))}
              className="w-32 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Maksimal Diskon (%)</label>
            <p className="text-xs text-[#444748] mb-2">
              Batas diskon manual (persentase atau nominal, dihitung setara persen dari subtotal) di apply_order_discount. 100 = tidak ada batas.
            </p>
            <input
              type="number"
              min={0}
              max={100}
              value={draft.max_discount_percent}
              onChange={e => setDraft(d => ({ ...d, max_discount_percent: Number(e.target.value) }))}
              className="w-32 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Maksimal Diskon KOL (%)</label>
            <p className="text-xs text-[#444748] mb-2">
              Batas diskon KOL di apply_order_kol, dihitung setara persen dari subtotal. 100 = tidak ada batas.
            </p>
            <input
              type="number"
              min={0}
              max={100}
              value={draft.kol_max_discount_percent}
              onChange={e => setDraft(d => ({ ...d, kol_max_discount_percent: Number(e.target.value) }))}
              className="w-32 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Pembulatan Harga (Rp)</label>
            <p className="text-xs text-[#444748] mb-2">
              Total quotation dibulatkan ke kelipatan nilai ini di recompute_quotation_total (mis. 1000). 0 = tanpa pembulatan.
            </p>
            <input
              type="number"
              min={0}
              step={100}
              value={draft.price_rounding_nearest}
              onChange={e => setDraft(d => ({ ...d, price_rounding_nearest: Number(e.target.value) }))}
              className="w-32 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.full_payment_only}
              onChange={e => setDraft(d => ({ ...d, full_payment_only: e.target.checked }))}
            />
            <span className="text-xs">
              <strong>Full Payment</strong> — wajibkan pembayaran penuh (tolak DP/Cicilan di record_order_payment)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.owner_override_enabled}
              onChange={e => setDraft(d => ({ ...d, owner_override_enabled: e.target.checked }))}
            />
            <span className="text-xs">
              <strong>Owner Override Harga</strong> — izinkan set_order_price_override dipakai
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold mb-1">Invoice Rules — Catatan Invoice</label>
            <p className="text-xs text-[#444748] mb-2">
              Tampil di get_order_invoice() sebagai invoice_notes (mis. syarat pembayaran).
            </p>
            <textarea
              value={draft.invoice_notes}
              onChange={e => setDraft(d => ({ ...d, invoice_notes: e.target.value }))}
              rows={3}
              className="w-full py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00] resize-none"
              placeholder="Contoh: DP tidak dapat dikembalikan setelah produksi dimulai."
            />
          </div>
        </section>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          {dirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="py-2 px-4 border border-[#c4c7c7] text-xs uppercase tracking-widest disabled:opacity-40"
            >
              Batalkan Perubahan
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
