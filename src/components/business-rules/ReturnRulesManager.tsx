'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getReturnRules, setReturnRules } from '@/lib/production/client'
import type { ReturnRules } from '@/lib/production/types'

interface ReturnRulesManagerProps {
  initialRules: ReturnRules
}

// Sprint K Milestone 1 — Return Rules: the QC "Kategori Temuan" picklist
// ("Kembalikan ke Penjahitan" reason), formerly hardcoded to
// QC_CHECKLIST_ITEMS, now owner-editable Runtime Configuration read live by
// the production kiosk (QcDecisionPanel). Same singleton +
// get_*_rules/set_*_rules pattern as every other Business Rules panel.
export function ReturnRulesManager({ initialRules }: ReturnRulesManagerProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [rules, setRules] = useState(initialRules)
  const [draft, setDraft] = useState<string[]>(initialRules.reasons)
  const [newReason, setNewReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const dirty = JSON.stringify(draft) !== JSON.stringify(rules.reasons)

  function handleAdd() {
    const reason = newReason.trim()
    if (!reason) return
    if (draft.includes(reason)) {
      setError('Kategori tersebut sudah ada.')
      return
    }
    setDraft(d => [...d, reason])
    setNewReason('')
    setError(null)
  }

  function handleRemove(index: number) {
    setDraft(d => d.filter((_, i) => i !== index))
  }

  function handleEdit(index: number, value: string) {
    setDraft(d => d.map((r, i) => (i === index ? value : r)))
  }

  async function handleSave() {
    const cleaned = draft.map(r => r.trim())
    if (cleaned.length === 0 || cleaned.some(r => !r)) {
      setError('Minimal satu Kategori Temuan, dan tidak boleh ada yang kosong.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await setReturnRules(supabase, cleaned)
      setRules(updated)
      setDraft(updated.reasons)
      setSaved(true)
    } catch (err) {
      console.error('[return-rules] save failed', err)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan Return Rules.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setSaving(true)
    setError(null)
    try {
      const latest = await getReturnRules(supabase)
      setRules(latest)
      setDraft(latest.reasons)
    } catch (err) {
      console.error('[return-rules] reload failed', err)
      setError('Gagal memuat ulang Return Rules.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Return Rules</h1>
          <p className="text-xs text-[#444748]">Kategori Temuan QC (alasan Kembalikan) — dibaca langsung oleh kiosk produksi, tanpa deploy</p>
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
            Tersimpan — picklist Kategori Temuan di kiosk QC langsung memakai daftar baru.
          </div>
        )}

        <section className="bg-white border-[0.5px] border-[#c4c7c7] p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">Daftar Kategori Temuan</h2>
          {draft.map((reason, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={reason}
                onChange={e => handleEdit(index, e.target.value)}
                className="flex-1 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-xs text-[#ba1a1a] hover:underline shrink-0"
              >
                Hapus
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2 border-t border-[#c4c7c7]/40">
            <input
              type="text"
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd()
              }}
              placeholder="Kategori temuan baru..."
              className="flex-1 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newReason.trim()}
              className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
            >
              Tambah
            </button>
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
