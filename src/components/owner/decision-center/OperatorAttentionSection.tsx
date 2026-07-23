'use client'

import type { OperatorKpiRow } from '@/lib/kpi/types'

type Bucket = 'over_capacity' | 'normal' | 'idle'

const BUCKET_ORDER: Bucket[] = ['over_capacity', 'normal', 'idle']
const BUCKET_HEADING: Record<Bucket, string> = {
  over_capacity: 'Operator Over Capacity',
  normal: 'Operator Normal',
  idle: 'Operator Idle',
}

// Over Capacity threshold (>100% utilisasi) matches Sprint H's
// get_capacity_warning() operator_overload signal exactly -- not a new
// number. Idle is 0 active jobs, the plainest possible reading of "idle".
function bucketOf(op: OperatorKpiRow): Bucket {
  if (op.capacity_utilization_pct != null && op.capacity_utilization_pct > 100) return 'over_capacity'
  if (op.active_jobs === 0) return 'idle'
  return 'normal'
}

function formatPct(pct: number | null): string {
  return pct == null ? '—' : `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

// Section 2 (Sprint I brief): get_operator_kpi_list() (Sprint G) grouped
// Over Capacity -> Normal -> Idle. Click -> OperatorDetailModal, the same
// modal KPI Operator already uses (fetches get_operator_kpi_detail itself).
export function OperatorAttentionSection({
  operators,
  onSelectOperator,
}: {
  operators: OperatorKpiRow[]
  onSelectOperator: (operatorId: string) => void
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Operator Attention</h2>
        <p className="text-body text-secondary">Klik operator untuk detail KPI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {BUCKET_ORDER.map(bucket => {
          const rows = operators
            .filter(op => bucketOf(op) === bucket)
            .sort((a, b) => (b.capacity_utilization_pct ?? 0) - (a.capacity_utilization_pct ?? 0))
          return (
            <div
              key={bucket}
              className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-outline-variant/80 flex items-center justify-between">
                <p className="text-body font-medium text-on-surface">{BUCKET_HEADING[bucket]}</p>
                <span className="text-label text-secondary">{rows.length}</span>
              </div>

              {rows.length === 0 ? (
                <p className="px-5 py-6 text-body text-secondary">Tidak ada operator.</p>
              ) : (
                <ul className="divide-y divide-outline-variant max-h-[360px] overflow-y-auto">
                  {rows.map(op => (
                    <li key={op.operator_id}>
                      <button
                        type="button"
                        onClick={() => onSelectOperator(op.operator_id)}
                        className="w-full text-left px-5 py-3 hover:bg-on-surface/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                      >
                        <p className="text-body font-medium text-on-surface truncate">{op.nama}</p>
                        <p className="text-body text-secondary mt-0.5">
                          {op.active_jobs}/{op.max_concurrent_capacity} pekerjaan · {formatPct(op.capacity_utilization_pct)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
