'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCapacityCalendar, setCapacityCalendarDay } from '@/lib/capacity/client'
import type { CapacityCalendarDay } from '@/lib/capacity/types'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// Libur/Cuti operators reduce headcount, which get_operator_capacity()
// already reflects automatically (see supabase/migrations/20260804000000).
// This calendar is the separate, owner-set "Hari D" capacity number itself
// — how many new orders a given date can still take — so an owner planning
// around a known low-headcount day (e.g. several Cuti at once) can lower
// max_orders here to keep resolve_hari_d() from over-promising that date.
export function CapacityCalendarManager() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [days, setDays] = useState<CapacityCalendarDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const rangeStart = todayIso()
  const rangeEnd = addDaysIso(rangeStart, 30)
  const dateList = Array.from({ length: 31 }, (_, i) => addDaysIso(rangeStart, i))

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const rows = await getCapacityCalendar(supabase, rangeStart, rangeEnd)
        if (!cancelled) setDays(rows)
      } catch (err) {
        console.error('[business-rules] load capacity calendar failed', err)
        if (!cancelled) setError('Gagal memuat Kalender Kapasitas.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dayByDate = new Map(days.map(d => [d.calendar_date, d]))

  async function handleSave(date: string) {
    const raw = drafts[date]
    const value = Number(raw)
    if (!Number.isFinite(value) || value < 0) {
      setError('Max order harus angka >= 0.')
      return
    }
    setSaving(date)
    setError(null)
    try {
      await setCapacityCalendarDay(supabase, date, value)
      setDays(await getCapacityCalendar(supabase, rangeStart, rangeEnd))
    } catch (err) {
      console.error('[business-rules] save capacity day failed', err)
      setError('Gagal menyimpan kapasitas tanggal ini.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Business Rules — Kalender Kapasitas</h1>
          <p className="text-xs text-[#444748]">Max order baru per tanggal (Hari D). Kosong = tidak dibatasi.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/owner/master-data-center')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-8 max-w-2xl mx-auto space-y-3">
        {error && (
          <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded text-sm text-[#ba1a1a]">
            {error}
          </div>
        )}
        {loading && <p className="text-sm text-[#444748]">Memuat...</p>}
        {!loading &&
          dateList.map(date => {
            const existing = dayByDate.get(date)
            const draft = drafts[date] ?? (existing ? String(existing.max_orders) : '')
            return (
              <div key={date} className="bg-white border-[0.5px] border-[#c4c7c7] p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-hanken text-sm">
                    {new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-[10px] text-[#444748]">
                    {existing ? `Diatur: ${existing.max_orders} order` : 'Belum diatur (tidak dibatasi)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={draft}
                    onChange={e => setDrafts(prev => ({ ...prev, [date]: e.target.value }))}
                    className="w-20 py-1.5 px-2 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSave(date)}
                    disabled={saving === date || draft === ''}
                    className="py-1.5 px-3 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
                  >
                    {saving === date ? '...' : 'Simpan'}
                  </button>
                </div>
              </div>
            )
          })}
      </main>
    </div>
  )
}
