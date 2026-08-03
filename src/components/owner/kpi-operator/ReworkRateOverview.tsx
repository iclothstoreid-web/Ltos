'use client'

import { summarizePerformance, startOfWeek } from '@/lib/kpi/performanceMetrics'
import type { DivisiKpiRow, OperatorKpiRow, OperatorPerformanceRecord } from '@/lib/kpi/types'

function formatPct(pct: number | null): string {
  return pct == null ? '—' : `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

function rowKey(row: DivisiKpiRow): string {
  return row.division_id ?? row.divisi
}

// Records "decided" (completed_at set) within [startMs, now] -- same anchor
// summarizePerformance() already uses to bucket weeklyProductivity/
// monthlyProductivity, reused here instead of a second period definition.
function filterSince(records: OperatorPerformanceRecord[], startMs: number): OperatorPerformanceRecord[] {
  return records.filter(record => record.completed_at != null && new Date(record.completed_at).getTime() >= startMs)
}

// Sprint N.3 (Owner Intelligence item 8) -- Rework Rate Dashboard's
// aggregate view. Per-operator Return Rate already exists (OperatorKpiTable's
// sortable column) and per-divisi Return Rate already exists on-demand
// (DivisiMembersModal, one divisi at a time) -- the gap this component closes
// is the missing PERIOD dimension plus a side-by-side divisi comparison,
// without a new page/route/dashboard. Reuses summarizePerformance() as-is
// for every number below; no new rate formula (alterCount/decidedCount stays
// the single definition, per that function's own doc comment).
export function ReworkRateOverview({
  operators,
  divisiRows,
  performanceRecords,
  onSelectDivisi,
}: {
  operators: OperatorKpiRow[]
  divisiRows: DivisiKpiRow[]
  performanceRecords: OperatorPerformanceRecord[]
  onSelectDivisi: (division: { id: string | null; label: string }) => void
}) {
  const now = new Date()
  const weekStartMs = startOfWeek(now).getTime()
  const monthStartMs = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

  const allTime = summarizePerformance(performanceRecords)
  const thisWeek = summarizePerformance(filterSince(performanceRecords, weekStartMs))
  const thisMonth = summarizePerformance(filterSince(performanceRecords, monthStartMs))

  const divisiRates = divisiRows.map(row => {
    const memberIds = new Set(
      operators.filter(op => op.division_id === row.division_id).map(op => op.operator_id)
    )
    const records = performanceRecords.filter(record => record.operator_id && memberIds.has(record.operator_id))
    return { row, summary: summarizePerformance(records) }
  })

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Rework Rate Overview</h2>
        <p className="text-body text-secondary">Alter / keputusan stage — per periode &amp; per divisi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-4 elev-1">
          <p className="text-body text-secondary">Sepanjang Waktu</p>
          <p className="text-heading-sm text-on-surface mt-1">{formatPct(allTime.returnRatePct)}</p>
        </div>
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-4 elev-1">
          <p className="text-body text-secondary">Minggu Ini</p>
          <p className="text-heading-sm text-on-surface mt-1">{formatPct(thisWeek.returnRatePct)}</p>
        </div>
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-4 elev-1">
          <p className="text-body text-secondary">Bulan Ini</p>
          <p className="text-heading-sm text-on-surface mt-1">{formatPct(thisMonth.returnRatePct)}</p>
        </div>
      </div>

      {divisiRates.length === 0 ? (
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-10 text-center elev-1">
          <p className="text-body text-secondary">Belum ada data divisi.</p>
        </div>
      ) : (
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 overflow-hidden elev-1 divide-y divide-outline-variant">
          {divisiRates.map(({ row, summary }) => (
            <button
              key={rowKey(row)}
              type="button"
              onClick={() => onSelectDivisi({ id: row.division_id, label: row.divisi })}
              className="w-full flex items-center justify-between gap-4 px-5 py-3 text-left hover:bg-on-surface/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
            >
              <span className="text-body text-on-surface">{row.divisi}</span>
              <span className="text-body text-secondary">
                {formatPct(summary.returnRatePct)} ({summary.alterCount} alter)
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
