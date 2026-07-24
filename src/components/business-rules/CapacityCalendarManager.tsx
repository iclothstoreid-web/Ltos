'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCapacityCalendar, getCapacityOverrideAuditLog, setCapacityCalendarDay } from '@/lib/capacity/client'
import type { CapacityCalendarDay, CapacityOverrideAuditLogEntry } from '@/lib/capacity/types'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// Sprint K (LOCK V1) §12-14 -- Capacity Rules is now an OUTPUT ENGINE, not a
// manual input form. Each day shows the computed value (from
// compute_daily_capacity: aktif operators x concurrent capacity,
// bottlenecked across staffed production divisi); Override requires a
// mandatory reason and is logged to capacity_override_audit_log.
export function CapacityCalendarManager() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [days, setDays] = useState<CapacityCalendarDay[]>([])
  const [auditLog, setAuditLog] = useState<CapacityOverrideAuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const [overridingDate, setOverridingDate] = useState<string | null>(null)
  const [overrideValue, setOverrideValue] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  const rangeStart = todayIso()
  const rangeEnd = addDaysIso(rangeStart, 30)
  const dateList = Array.from({ length: 31 }, (_, i) => addDaysIso(rangeStart, i))

  async function loadAll() {
    setLoading(true)
    try {
      const [calendarRows, auditRows] = await Promise.all([
        getCapacityCalendar(supabase, rangeStart, rangeEnd),
        getCapacityOverrideAuditLog(supabase),
      ])
      setDays(calendarRows)
      setAuditLog(auditRows)
    } catch (err) {
      console.error('[business-rules] load capacity calendar failed', err)
      setError('Gagal memuat Kalender Kapasitas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dayByDate = new Map(days.map(d => [d.calendar_date, d]))

  function startOverride(day: CapacityCalendarDay) {
    setOverridingDate(day.calendar_date)
    setOverrideValue(String(day.effective_max_orders))
    setOverrideReason('')
    setError(null)
  }

  async function handleSaveOverride() {
    if (!overridingDate) return
    const value = Number(overrideValue)
    if (!Number.isFinite(value) || value < 0) {
      setError('Max order harus angka >= 0.')
      return
    }
    if (!overrideReason.trim()) {
      setError('Alasan override wajib diisi.')
      return
    }
    setSaving(overridingDate)
    setError(null)
    try {
      await setCapacityCalendarDay(supabase, overridingDate, value, overrideReason.trim())
      setOverridingDate(null)
      await loadAll()
    } catch (err) {
      console.error('[business-rules] save capacity override failed', err)
      setError('Gagal menyimpan override kapasitas.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Business Rules — Capacity Rules</h1>
          <p className="text-xs text-[#444748]">
            Kapasitas dihitung otomatis dari operator aktif. Override memerlukan alasan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/owner/business-rules')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-8 max-w-2xl mx-auto space-y-8">
        {error && (
          <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded text-sm text-[#ba1a1a]">
            {error}
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">
            Kalender Kapasitas {loading && '· Memuat...'}
          </h2>
          {!loading &&
            dateList.map(date => {
              const day = dayByDate.get(date)
              const isOverriding = overridingDate === date
              return (
                <div key={date} className="bg-white border-[0.5px] border-[#c4c7c7] p-3 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-hanken text-sm">
                        {new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-[10px] text-[#444748]">
                        Computed: {day?.computed_max_orders ?? '—'} order
                        {day?.is_override && (
                          <span className="text-[#755b00]"> · Override: {day.effective_max_orders} order</span>
                        )}
                      </p>
                      {day?.is_override && day.override_reason && (
                        <p className="text-[10px] text-[#755b00]">Alasan: {day.override_reason}</p>
                      )}
                    </div>
                    {!isOverriding && (
                      <button
                        type="button"
                        onClick={() => day && startOverride(day)}
                        className="py-1.5 px-3 border border-[#c4c7c7] text-xs uppercase tracking-widest hover:border-[#755b00] transition-colors"
                      >
                        Override
                      </button>
                    )}
                  </div>

                  {isOverriding && (
                    <div className="space-y-2 pt-2 border-t border-[#e5e5e0]">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={overrideValue}
                          onChange={e => setOverrideValue(e.target.value)}
                          className="w-20 py-1.5 px-2 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                        />
                        <span className="text-xs text-[#444748]">order</span>
                      </div>
                      <input
                        type="text"
                        value={overrideReason}
                        onChange={e => setOverrideReason(e.target.value)}
                        placeholder="Alasan override (wajib)"
                        className="w-full py-1.5 px-2 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveOverride}
                          disabled={saving === date}
                          className="py-1.5 px-3 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
                        >
                          {saving === date ? '...' : 'Simpan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverridingDate(null)}
                          className="py-1.5 px-3 border border-[#c4c7c7] text-xs uppercase tracking-widest"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">Riwayat Override</h2>
          {auditLog.length === 0 && <p className="text-sm text-[#444748]">Belum ada override.</p>}
          {auditLog.map(entry => (
            <div key={entry.id} className="bg-white border-[0.5px] border-[#c4c7c7] p-3">
              <p className="font-hanken text-sm">
                {new Date(entry.calendar_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                {': '}
                {entry.old_max_orders ?? '—'} → {entry.new_max_orders ?? '—'}
              </p>
              <p className="text-xs text-[#444748]">{entry.reason}</p>
              <p className="text-[10px] text-[#444748] mt-1">{formatDateTime(entry.changed_at)}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
