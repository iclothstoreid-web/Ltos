'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getServiceSlaRules, setServiceSlaRule, type ServiceSlaRule } from '@/lib/order/service'

interface ServiceRulesManagerProps {
  initialRules: ServiceSlaRule[]
}

export function ServiceRulesManager({ initialRules }: ServiceRulesManagerProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [rules, setRules] = useState(initialRules)
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialRules.map(r => [r.service_level, String(r.working_days)]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(serviceLevel: ServiceSlaRule['service_level']) {
    const value = Number(drafts[serviceLevel])
    if (!Number.isFinite(value) || value <= 0) {
      setError('Jumlah hari kerja harus lebih dari 0.')
      return
    }
    setSaving(serviceLevel)
    setError(null)
    try {
      await setServiceSlaRule(supabase, serviceLevel, value)
      setRules(await getServiceSlaRules(supabase))
    } catch (err) {
      console.error('[service-rules] save failed', err)
      setError('Gagal menyimpan Service Rule.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Service Rules</h1>
          <p className="text-xs text-[#444748]">Jumlah hari kerja SLA per tingkat layanan (Hari D & Estimasi)</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/owner/master-data-center')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-8 max-w-2xl mx-auto space-y-4">
        {error && (
          <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded text-sm text-[#ba1a1a]">
            {error}
          </div>
        )}
        {rules.map(rule => (
          <div key={rule.service_level} className="bg-white border-[0.5px] border-[#c4c7c7] p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-hanken text-sm font-semibold">{rule.label}</p>
              <p className="text-xs text-[#444748]">{rule.service_level}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={drafts[rule.service_level] ?? ''}
                onChange={e => setDrafts(prev => ({ ...prev, [rule.service_level]: e.target.value }))}
                className="w-20 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
              />
              <span className="text-xs text-[#444748]">hari kerja</span>
              <button
                type="button"
                onClick={() => handleSave(rule.service_level)}
                disabled={saving === rule.service_level}
                className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
              >
                {saving === rule.service_level ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
