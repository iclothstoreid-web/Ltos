'use client'

import type { OperatorKpiRow } from '@/lib/kpi/types'

function formatDuration(minutes: number | null): string {
  if (minutes == null) return '—'
  if (minutes < 60) return `${Math.round(minutes)} mnt`
  return `${(minutes / 60).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jam`
}

function formatPct(pct: number | null): string {
  return pct == null ? '—' : `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

// Daftar Operator table -- reads get_operator_kpi_list() (Sprint G) as-is.
// A native <table> (not a fixed-fraction CSS grid) so every column sizes to
// its own content/header -- a grid-cols-12 layout left Efficiency/Capacity/
// Status too narrow for their uppercase headers (found in visual review).
// Row click opens OperatorDetailModal via the parent's onSelectOperator,
// same row-click-opens-modal pattern as BottleneckPanel/OrderDetailModal.
export function OperatorKpiTable({
  operators,
  onSelectOperator,
  title = 'Daftar Operator',
}: {
  operators: OperatorKpiRow[]
  onSelectOperator: (operatorId: string) => void
  title?: string
}) {
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
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-on-surface/5 border-b border-outline-variant/80">
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Nama Operator
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Order Dikerjakan
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Order Selesai
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Avg Duration
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Efficiency
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Capacity
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {operators.map(op => (
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
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">{op.order_dikerjakan}</td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">{op.order_selesai}</td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {formatDuration(op.avg_duration_minutes)}
                    </td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {formatPct(op.efficiency_pct)}
                    </td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {op.active_jobs}/{op.max_concurrent_capacity}
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
