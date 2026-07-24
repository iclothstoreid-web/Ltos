'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getOperatorKpiDetail } from '@/lib/kpi/client'
import { getRuleBasedDiagnosis, summarizePerformance } from '@/lib/kpi/performanceMetrics'
import type { OperatorKpiDetail, OperatorPerformanceRecord } from '@/lib/kpi/types'
import { getProductionRules } from '@/lib/production/client'
import type { ProductionRules } from '@/lib/production/types'
import { STAGE_ORDER, STAGE_LABELS } from '@/lib/production/stageConfig'

interface OperatorDetailModalProps {
  operatorId: string
  onClose: () => void
}

interface RelatedBusinessEvent {
  order_id: string | null
  event_type: string
  created_at: string
}

function formatDuration(minutes: number | null): string {
  if (minutes == null) return '-'
  if (minutes < 60) return `${Math.round(minutes)} mnt`
  return `${(minutes / 60).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jam`
}

function formatPct(pct: number | null): string {
  return pct == null ? '-' : `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function humanizeEventType(eventType: string): string {
  return eventType.replace(/[._]/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

// Extends the existing KPI drill-down. All accountability rows are facts
// already present in stage records and business events; this modal writes no
// data and does not introduce a second KPI source.
export function OperatorDetailModal({ operatorId, onClose }: OperatorDetailModalProps) {
  const [supabase] = useState(() => createClient())
  const [detail, setDetail] = useState<OperatorKpiDetail | null>(null)
  const [performanceRecords, setPerformanceRecords] = useState<OperatorPerformanceRecord[]>([])
  const [businessEvents, setBusinessEvents] = useState<RelatedBusinessEvent[]>([])
  const [productionRules, setProductionRules] = useState<ProductionRules | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [result, rules, recordsResult] = await Promise.all([
          getOperatorKpiDetail(supabase, operatorId),
          getProductionRules(supabase),
          supabase
            .from('production_stage_records')
            .select('order_id, operator_id, stage, attempt, decision, alter_category, notes, division, started_at, completed_at, created_at')
            .eq('operator_id', operatorId)
            .order('completed_at', { ascending: false })
            .limit(500),
        ])
        if (recordsResult.error) throw recordsResult.error

        const records = (recordsResult.data || []) as OperatorPerformanceRecord[]
        const orderIds = Array.from(new Set(records.map(record => record.order_id)))
        const eventsResult = orderIds.length
          ? await supabase
              .from('business_events')
              .select('order_id, event_type, created_at')
              .in('order_id', orderIds)
              .order('created_at', { ascending: false })
              .limit(50)
          : { data: [] as RelatedBusinessEvent[], error: null }
        if (eventsResult.error) throw eventsResult.error
        if (cancelled) return

        setDetail(result)
        setProductionRules(rules)
        setPerformanceRecords(records)
        setBusinessEvents((eventsResult.data || []) as RelatedBusinessEvent[])
      } catch (err) {
        console.error('[kpi-operator] load operator detail failed', err)
        if (!cancelled) setError('Gagal memuat detail operator.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [supabase, operatorId])

  const stagesWithData = detail ? STAGE_ORDER.filter(stage => detail.performance_per_stage[stage]) : []
  const summary = summarizePerformance(performanceRecords)
  const returns = performanceRecords.filter(record => record.decision === 'alter')
  const diagnosis = productionRules
    ? getRuleBasedDiagnosis(summary, productionRules.max_alter_attempts, STAGE_LABELS[productionRules.alter_return_stage])
    : null

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-sm shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-[#e5e5e0] z-10">
          <h2 className="font-hanken text-sm uppercase tracking-widest text-[#161b29]">Detail Operator</h2>
          <button type="button" onClick={onClose} aria-label="Tutup"><X size={18} className="text-[#46464c]" /></button>
        </div>

        {loading && <p className="px-6 py-10 text-center font-hanken text-sm text-[#46464c]">Memuat...</p>}
        {error && <p className="px-6 py-10 text-center font-hanken text-sm text-[#c0392b]">{error}</p>}
        {!loading && !error && !detail && <p className="px-6 py-10 text-center font-hanken text-sm text-[#46464c]">Operator tidak ditemukan.</p>}

        {!loading && !error && detail && (
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Nama</p><p className="font-hanken text-sm text-[#161b29]">{detail.profile.nama}</p></div>
              <div><p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Status</p><p className="font-hanken text-sm text-[#161b29]">{detail.profile.is_active ? 'Aktif' : 'Non-aktif'}</p></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Metric label="Primary Task Time" value={formatDuration(summary.primaryTaskMinutes ?? detail.avg_duration_minutes)} />
              <Metric label="Alter Count" value={summary.alterCount.toLocaleString('id-ID')} />
              <Metric label="Alter Time" value={formatDuration(summary.alterMinutes || null)} />
              <Metric label="Return Rate" value={formatPct(summary.returnRatePct)} />
              <Metric label="Productivity" value={(summary.productivity || detail.order_selesai).toLocaleString('id-ID')} />
              <Metric label="Utilization" value={formatPct(detail.capacity.utilization_pct)} />
            </div>

            <section className="border-y border-[#e5e5e0] py-4">
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-1">Rule-Based Diagnosis</p>
              <p className="font-hanken text-sm text-[#161b29]">{diagnosis || 'Memuat aturan produksi...'}</p>
              <p className="font-hanken text-[10px] text-[#46464c] mt-1">{detail.capacity.active_jobs}/{detail.capacity.max_concurrent_capacity} pekerjaan aktif.</p>
            </section>

            <section>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-3">Trend</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Metric label="Weekly Trend" value={`${summary.weeklyProductivity} order`} />
                <Metric label="Monthly Trend" value={`${summary.monthlyProductivity} order`} />
              </div>
              <div className="grid grid-cols-8 gap-2 items-end h-20" aria-label="Riwayat delapan minggu">
                {summary.eightWeekHistory.map(point => (
                  <div key={point.label} className="flex h-full min-w-0 flex-col justify-end gap-1">
                    <span className="text-center font-hanken text-[10px] text-[#46464c]">{point.value}</span>
                    <span className="block min-h-1 bg-[#161b29]" style={{ height: `${Math.max(4, point.value * 14)}px` }} />
                    <span className="truncate text-center font-hanken text-[9px] text-[#46464c]">{point.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Return & Alter History</p>
              {returns.length === 0 ? <p className="font-hanken text-xs text-[#46464c]">Belum ada return atau alter.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-xs font-hanken"><thead><tr className="border-b border-[#e5e5e0] text-left text-[10px] uppercase tracking-widest text-[#46464c]"><th className="py-2 pr-2">From Division</th><th className="py-2 pr-2">To Division</th><th className="py-2 pr-2">Operator</th><th className="py-2 pr-2">Return Reason</th><th className="py-2">Timestamp</th></tr></thead><tbody>
                    {returns.map(record => <tr key={`${record.order_id}-${record.stage}-${record.attempt}`} className="border-b border-[#f0efe9]"><td className="py-2 pr-2 text-[#161b29]">{record.division || STAGE_LABELS[record.stage]}</td><td className="py-2 pr-2 text-[#46464c]">{STAGE_LABELS[record.stage === 'qc' && productionRules ? productionRules.alter_return_stage : record.stage]}</td><td className="py-2 pr-2 text-[#46464c]">{detail.profile.nama}</td><td className="py-2 pr-2 text-[#46464c]">{record.alter_category || record.notes || 'Tidak dicatat'}</td><td className="py-2 text-[#46464c] whitespace-nowrap">{formatDateTime(record.completed_at || record.created_at)}</td></tr>)}
                  </tbody></table>
                </div>
              )}
            </section>

            <section>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Performance per Stage</p>
              {stagesWithData.length === 0 ? <p className="font-hanken text-xs text-[#46464c]">Belum ada data per-stage.</p> : <div className="space-y-2">{stagesWithData.map(stage => { const perf = detail.performance_per_stage[stage]!; return <div key={stage} className="flex items-center justify-between text-xs font-hanken gap-4"><span className="text-[#161b29] shrink-0">{STAGE_LABELS[stage]}</span><span className="text-[#46464c] text-right">{perf.completed_jobs} selesai | {formatDuration(perf.avg_duration_minutes)} | {formatPct(perf.alter_rate_pct)} alter</span></div> })}</div>}
            </section>

            <section>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Order History</p>
              {detail.riwayat_pekerjaan.length === 0 ? <p className="font-hanken text-xs text-[#46464c]">Belum ada riwayat pekerjaan.</p> : <div className="overflow-x-auto"><table className="w-full text-xs font-hanken min-w-[560px]"><thead><tr className="text-left text-[10px] uppercase tracking-widest text-[#46464c] border-b border-[#e5e5e0]"><th className="py-2 pr-2">Order</th><th className="py-2 pr-2">Stage</th><th className="py-2 pr-2">Mulai</th><th className="py-2 pr-2">Selesai</th><th className="py-2">Durasi</th></tr></thead><tbody>{detail.riwayat_pekerjaan.map((job, index) => <tr key={`${job.order_id}-${job.stage}-${index}`} className="border-b border-[#f0efe9] last:border-0"><td className="py-2 pr-2 text-[#161b29]">{job.order_number}</td><td className="py-2 pr-2 text-[#46464c]">{STAGE_LABELS[job.stage]}</td><td className="py-2 pr-2 text-[#46464c] whitespace-nowrap">{formatDateTime(job.started_at)}</td><td className="py-2 pr-2 text-[#46464c] whitespace-nowrap">{formatDateTime(job.completed_at)}</td><td className="py-2 text-[#46464c]">{formatDuration(job.duration_minutes)}</td></tr>)}</tbody></table></div>}
            </section>

            <section>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Business Event Timeline</p>
              {businessEvents.length === 0 ? <p className="font-hanken text-xs text-[#46464c]">Belum ada Business Event pada order terkait.</p> : <ul className="space-y-2">{businessEvents.map((event, index) => <li key={`${event.event_type}-${event.order_id}-${index}`} className="flex items-center justify-between gap-4"><span className="font-hanken text-xs text-[#161b29]">{humanizeEventType(event.event_type)}</span><span className="font-hanken text-[10px] text-[#46464c] whitespace-nowrap">{formatDateTime(event.created_at)}</span></li>)}</ul>}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">{label}</p><p className="font-hanken text-lg text-[#161b29] mt-1">{value}</p></div>
}
