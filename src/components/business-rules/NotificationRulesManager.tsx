'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getNotificationRules, setNotificationRules } from '@/lib/production/client'
import type { NotificationRules } from '@/lib/production/types'

interface NotificationRulesManagerProps {
  initialRules: NotificationRules
}

// Sprint K Milestone 1 — Notification Rules: governs whether
// assign_stage_operator() creates the kiosk-wide "Pekerjaan Baru
// Ditugaskan" notification. One real, engine-read parameter — this panel
// only lists what an engine actually consumes, per the Business Rules
// principle (parameters, never placeholders).
export function NotificationRulesManager({ initialRules }: NotificationRulesManagerProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [rules, setRules] = useState(initialRules)
  const [draft, setDraft] = useState(initialRules.assignment_notification_enabled)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const dirty = draft !== rules.assignment_notification_enabled

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await setNotificationRules(supabase, draft)
      setRules(updated)
      setDraft(updated.assignment_notification_enabled)
      setSaved(true)
    } catch (err) {
      console.error('[notification-rules] save failed', err)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan Notification Rules.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setSaving(true)
    setError(null)
    try {
      const latest = await getNotificationRules(supabase)
      setRules(latest)
      setDraft(latest.assignment_notification_enabled)
    } catch (err) {
      console.error('[notification-rules] reload failed', err)
      setError('Gagal memuat ulang Notification Rules.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Notification Rules</h1>
          <p className="text-xs text-[#444748]">Runtime Configuration — dibaca langsung oleh assign_stage_operator, tanpa deploy</p>
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
            Tersimpan — pengaturan notifikasi langsung berlaku.
          </div>
        )}

        <section className="bg-white border-[0.5px] border-[#c4c7c7] p-4 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft}
              onChange={e => setDraft(e.target.checked)}
            />
            <span className="text-xs">
              <strong>Notifikasi Penugasan Operator</strong> — saat Owner menugaskan operator (Tugaskan), buat entri
              &quot;Pekerjaan Baru Ditugaskan&quot; di panel lonceng kiosk /production
            </span>
          </label>
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
