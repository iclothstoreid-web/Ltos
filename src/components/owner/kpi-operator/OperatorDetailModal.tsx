'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getOperatorKpiDetail } from '@/lib/kpi/client'
import type { OperatorKpiDetail } from '@/lib/kpi/types'
import { STAGE_ORDER, STAGE_LABELS } from '@/lib/production/stageConfig'

interface OperatorDetailModalProps {
  operatorId: string
  onClose: () => void
}

function formatDuration(minutes: number | null): string {
  if (minutes == null) return '—'
  if (minutes < 60) return `${Math.round(minutes)} mnt`
  return `${(minutes / 60).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jam`
}

function formatPct(pct: number | null): string {
  return pct == null ? '—' : `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

// Year omitted -- Riwayat Pekerjaan only ever shows recent jobs, and the
// full "23 Jul 2026, 07:33" form made this table wide enough to force
// horizontal scroll inside an already vertically-scrolling modal on mobile
// (found in visual review).
function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Detail Operator overlay -- opened by clicking a row in OperatorKpiTable.
// Fetches get_operator_kpi_detail(operatorId) (Sprint G) client-side, same
// fetch-on-open pattern as OrderDetailModal.
export function OperatorDetailModal({ operatorId, onClose }: OperatorDetailModalProps) {
  const [supabase] = useState(() => createClient())
  const [detail, setDetail] = useState<OperatorKpiDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getOperatorKpiDetail(supabase, operatorId)
        if (cancelled) return
        setDetail(result)
      } catch (err) {
        console.error('[kpi-operator] load operator detail failed', err)
        if (!cancelled) setError('Gagal memuat detail operator.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [supabase, operatorId])

  const stagesWithData = detail ? STAGE_ORDER.filter(stage => detail.performance_per_stage[stage]) : []

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-sm shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-[#e5e5e0] z-10">
          <h2 className="font-hanken text-sm uppercase tracking-widest text-[#161b29]">Detail Operator</h2>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <X size={18} className="text-[#46464c]" />
          </button>
        </div>

        {loading && <p className="px-6 py-10 text-center font-hanken text-sm text-[#46464c]">Memuat...</p>}
        {error && <p className="px-6 py-10 text-center font-hanken text-sm text-[#c0392b]">{error}</p>}
        {!loading && !error && !detail && (
          <p className="px-6 py-10 text-center font-hanken text-sm text-[#46464c]">Operator tidak ditemukan.</p>
        )}

        {!loading && !error && detail && (
          <div className="px-6 py-6 space-y-6">
            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Profil Operator</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Nama</p>
                  <p className="font-hanken text-sm text-[#161b29]">{detail.profile.nama}</p>
                </div>
                <div>
                  <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Status</p>
                  <p className="font-hanken text-sm text-[#161b29]">
                    {detail.profile.is_active ? 'Aktif' : 'Non-aktif'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Order Aktif</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{detail.order_aktif}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Order Selesai</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{detail.order_selesai}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Avg Duration</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{formatDuration(detail.avg_duration_minutes)}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Efficiency</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{formatPct(detail.efficiency_pct)}</p>
              </div>
            </div>

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Capacity</p>
              <p className="font-hanken text-sm text-[#161b29]">
                {detail.capacity.active_jobs} / {detail.capacity.max_concurrent_capacity} pekerjaan aktif
                {detail.capacity.utilization_pct != null ? ` · ${detail.capacity.utilization_pct}% utilisasi` : ''}
              </p>
            </div>

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">
                Performance per Stage
              </p>
              {stagesWithData.length === 0 ? (
                <p className="font-hanken text-xs text-[#46464c]">Belum ada data per-stage.</p>
              ) : (
                <div className="space-y-2">
                  {stagesWithData.map(stage => {
                    const perf = detail.performance_per_stage[stage]!
                    return (
                      <div key={stage} className="flex items-center justify-between text-xs font-hanken gap-4">
                        <span className="text-[#161b29] shrink-0">{STAGE_LABELS[stage]}</span>
                        <span className="text-[#46464c] text-right">
                          {perf.completed_jobs} selesai · {formatDuration(perf.avg_duration_minutes)} ·{' '}
                          {formatPct(perf.alter_rate_pct)} alter
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">
                Riwayat Pekerjaan
              </p>
              {detail.riwayat_pekerjaan.length === 0 ? (
                <p className="font-hanken text-xs text-[#46464c]">Belum ada riwayat pekerjaan.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-hanken min-w-[560px]">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-widest text-[#46464c] border-b border-[#e5e5e0]">
                        <th className="py-2 pr-2">Order</th>
                        <th className="py-2 pr-2">Stage</th>
                        <th className="py-2 pr-2">Mulai</th>
                        <th className="py-2 pr-2">Selesai</th>
                        <th className="py-2">Durasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.riwayat_pekerjaan.map((job, i) => (
                        <tr key={`${job.order_id}-${job.stage}-${i}`} className="border-b border-[#f0efe9] last:border-0">
                          <td className="py-2 pr-2 text-[#161b29]">{job.order_number}</td>
                          <td className="py-2 pr-2 text-[#46464c]">{STAGE_LABELS[job.stage]}</td>
                          <td className="py-2 pr-2 text-[#46464c] whitespace-nowrap">{formatDateTime(job.started_at)}</td>
                          <td className="py-2 pr-2 text-[#46464c] whitespace-nowrap">{formatDateTime(job.completed_at)}</td>
                          <td className="py-2 text-[#46464c]">{formatDuration(job.duration_minutes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
