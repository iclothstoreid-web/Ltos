'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getProductionRules, setProductionRules } from '@/lib/production/client'
import type { ProductionRules, ProductionStage } from '@/lib/production/types'
import { STAGE_LABELS } from '@/lib/production/stageConfig'

interface ProductionRulesManagerProps {
  initialRules: ProductionRules
}

// alter_return_stage must be a stage strictly before QC in the locked
// 8-stage order (see the check constraint in the migration) — QC rework
// always moves backward, never forward past itself.
const ALTER_RETURN_STAGE_OPTIONS: ProductionStage[] = [
  'material_prep',
  'pattern_formulation',
  'cutting',
  'sewing',
]

// Runtime Configuration for the Production Engine (UX Cleanup sprint) — read
// live by complete_stage and the kiosk workspace itself
// (supabase/migrations/20260811000000_add_business_rules_runtime_config.sql).
// The locked 8-stage order never changes here — only what's required/allowed
// at each step. Skip Stage was deliberately removed from this panel: a
// global toggle that lets any order's current stage be skipped is a
// workflow change, not an operational parameter. That capability now lives
// as Emergency Override — Owner OS's Detail Order screen, per order, per
// stage, mandatory reason, always audited (see
// 20260812000000_replace_skip_stage_with_emergency_override.sql) — never a
// standing rule anyone can flip on.
export function ProductionRulesManager({ initialRules }: ProductionRulesManagerProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [rules, setRules] = useState(initialRules)
  const [draft, setDraft] = useState(initialRules)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const dirty = JSON.stringify(draft) !== JSON.stringify(rules)

  async function handleSave() {
    if (draft.max_alter_attempts < 1) {
      setError('Maksimum Alter harus minimal 1.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await setProductionRules(supabase, draft)
      setRules(updated)
      setDraft(updated)
      setSaved(true)
    } catch (err) {
      console.error('[production-rules] save failed', err)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan Production Rules.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setSaving(true)
    setError(null)
    try {
      const latest = await getProductionRules(supabase)
      setRules(latest)
      setDraft(latest)
    } catch (err) {
      console.error('[production-rules] reload failed', err)
      setError('Gagal memuat ulang Production Rules.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Production Rules</h1>
          <p className="text-xs text-[#444748]">Runtime Configuration — dibaca langsung oleh Production Engine, tanpa deploy</p>
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
            Tersimpan — Production Engine langsung memakai parameter baru.
          </div>
        )}

        <section className="bg-white border-[0.5px] border-[#c4c7c7] p-4 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.qr_required}
              onChange={e => setDraft(d => ({ ...d, qr_required: e.target.checked }))}
            />
            <span className="text-xs">
              <strong>QR Wajib</strong> — operator harus Scan QR Penyelesaian sebelum mengisi Bukti Foto &amp; Checklist
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.qc_checklist_required}
              onChange={e => setDraft(d => ({ ...d, qc_checklist_required: e.target.checked }))}
            />
            <span className="text-xs">
              <strong>QC Wajib</strong> — seluruh checklist Pemeriksaan Kualitas harus tercentang sebelum Setujui
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.delivery_confirmation_required}
              onChange={e => setDraft(d => ({ ...d, delivery_confirmation_required: e.target.checked }))}
            />
            <span className="text-xs">
              <strong>Delivery Wajib Konfirmasi</strong> — kurir &amp; nomor resi wajib diisi sebelum tahap Pengiriman selesai
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.auto_close_after_delivered}
              onChange={e => setDraft(d => ({ ...d, auto_close_after_delivered: e.target.checked }))}
            />
            <span className="text-xs">
              <strong>Auto Close setelah Delivered</strong> — order otomatis ditandai Delivered begitu tahap Pengiriman selesai, tanpa klik manual &quot;Tandai Sudah Diterima Customer&quot; di Owner OS
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold mb-1">Maksimum Alter</label>
            <p className="text-xs text-[#444748] mb-2">
              Jumlah percobaan maksimum per tahap, termasuk percobaan pertama. Percobaan melebihi batas ini ditolak complete_stage.
            </p>
            <input
              type="number"
              min={1}
              value={draft.max_alter_attempts}
              onChange={e => setDraft(d => ({ ...d, max_alter_attempts: Number(e.target.value) }))}
              className="w-32 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Alter Kembali ke Stage Mana</label>
            <p className="text-xs text-[#444748] mb-2">
              Tahap tujuan saat QC mengembalikan pekerjaan (&quot;Kembalikan ke Penjahitan&quot;). Tahap lain selain QC selalu kembali ke dirinya sendiri.
            </p>
            <select
              value={draft.alter_return_stage}
              onChange={e => setDraft(d => ({ ...d, alter_return_stage: e.target.value as ProductionStage }))}
              className="w-56 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            >
              {ALTER_RETURN_STAGE_OPTIONS.map(stage => (
                <option key={stage} value={stage}>
                  {STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
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
