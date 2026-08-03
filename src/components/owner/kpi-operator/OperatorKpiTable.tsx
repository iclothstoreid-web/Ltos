'use client'

import { useState } from 'react'
import { summarizePerformance } from '@/lib/kpi/performanceMetrics'
import type { OperatorKpiRow, OperatorPerformanceRecord } from '@/lib/kpi/types'

function formatDuration(minutes: number | null): string {
  if (minutes == null) return '—'
  if (minutes < 60) return `${Math.round(minutes)} mnt`
  return `${(minutes / 60).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jam`
}

function formatPct(pct: number | null): string {
  return pct == null ? '—' : `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

// Sprint N.2 item 6 (Owner Intelligence) -- "Operator Performance
// comparison": every metric this table needs was already computed
// (summarizePerformance) and rendered side-by-side per operator; the one
// gap the roadmap doc names is sortability. Client-side only -- no new
// RPC/query, same rows, same summarizePerformance() call.
type SortKey = 'nama' | 'primaryTaskMinutes' | 'alterCount' | 'returnRatePct' | 'productivity' | 'utilization'

const SORT_LABEL: Record<SortKey, string> = {
  nama: 'Nama Operator',
  primaryTaskMinutes: 'Primary Task Time',
  alterCount: 'Alter',
  returnRatePct: 'Return Rate',
  productivity: 'Productivity',
  utilization: 'Utilization',
}

function sortValue(key: SortKey, op: OperatorKpiRow, summary: ReturnType<typeof summarizePerformance>): number | string {
  switch (key) {
    case 'nama':
      return op.nama.toLowerCase()
    case 'primaryTaskMinutes':
      return summary.primaryTaskMinutes ?? op.avg_duration_minutes ?? -1
    case 'alterCount':
      return summary.alterCount
    case 'returnRatePct':
      return summary.returnRatePct ?? -1
    case 'productivity':
      return summary.productivity || op.order_selesai
    case 'utilization':
      return op.capacity_utilization_pct ?? -1
  }
}

// Daftar Operator table -- reads get_operator_kpi_list() (Sprint G) as-is.
// A native <table> (not a fixed-fraction CSS grid) so every column sizes to
// its own content/header -- a grid-cols-12 layout left Efficiency/Capacity/
// Status too narrow for their uppercase headers (found in visual review).
// Row click opens OperatorDetailModal via the parent's onSelectOperator,
// same row-click-opens-modal pattern as BottleneckPanel/OrderDetailModal.
export function OperatorKpiTable({
  operators,
  performanceRecords,
  onSelectOperator,
  title = 'Daftar Operator',
}: {
  operators: OperatorKpiRow[]
  performanceRecords: OperatorPerformanceRecord[]
  onSelectOperator: (operatorId: string) => void
  title?: string
}) {
  const [sortKey, setSortKey] = useState<SortKey>('nama')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(dir => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const recordsByOperator = new Map<string, OperatorPerformanceRecord[]>()
  for (const record of performanceRecords) {
    if (!record.operator_id) continue
    const records = recordsByOperator.get(record.operator_id) || []
    records.push(record)
    recordsByOperator.set(record.operator_id, records)
  }

  const rows = operators
    .map(op => ({ op, summary: summarizePerformance(recordsByOperator.get(op.operator_id) || []) }))
    .sort((a, b) => {
      const va = sortValue(sortKey, a.op, a.summary)
      const vb = sortValue(sortKey, b.op, b.summary)
      const cmp = typeof va === 'string' && typeof vb === 'string' ? va.localeCompare(vb) : (va as number) - (vb as number)
      return sortDir === 'asc' ? cmp : -cmp
    })

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">{title}</h2>
        <p className="text-body text-secondary">Klik baris untuk detail</p>
      </div>

      <div className="rounded-[4px] border border-border-subtle bg-surface-01/40 overflow-hidden relative elev-2">
        {operators.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-title text-on-surface mb-2">Belum ada operator</p>
            <p className="text-body text-secondary">Data operator akan muncul di sini setelah ditambahkan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] border-collapse">
              <thead>
                <tr className="bg-on-surface/5 border-b border-outline-variant/80">
                  {(['nama', 'primaryTaskMinutes', 'alterCount'] as SortKey[]).map(key => (
                    <th key={key} className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                      <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 hover:text-on-surface">
                        {SORT_LABEL[key]}
                        {sortKey === key && <span aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                      </button>
                    </th>
                  ))}
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Alter Time
                  </th>
                  {(['returnRatePct', 'productivity', 'utilization'] as SortKey[]).map(key => (
                    <th key={key} className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                      <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 hover:text-on-surface">
                        {SORT_LABEL[key]}
                        {sortKey === key && <span aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                      </button>
                    </th>
                  ))}
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Weekly / Monthly
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {rows.map(({ op, summary }) => (
                    <tr
                    key={op.operator_id}
                    onClick={() => onSelectOperator(op.operator_id)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectOperator(op.operator_id)
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-on-surface/5 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                  >
                    <td className="px-5 py-4 text-body font-medium text-on-surface whitespace-nowrap">{op.nama}</td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {formatDuration(summary.primaryTaskMinutes ?? op.avg_duration_minutes)}
                    </td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {summary.alterCount}
                    </td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {formatDuration(summary.alterMinutes || null)}
                    </td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {formatPct(summary.returnRatePct)}
                    </td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {summary.productivity || op.order_selesai}
                    </td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {formatPct(op.capacity_utilization_pct)}
                    </td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {summary.weeklyProductivity} / {summary.monthlyProductivity}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`text-label px-2 py-1 rounded-full uppercase tracking-widest ${
                          op.status === 'Aktif' ? 'bg-[#dce9df] text-[#1c5a34]' : 'bg-on-surface/10 text-secondary'
                        }`}
                      >
                        {op.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
