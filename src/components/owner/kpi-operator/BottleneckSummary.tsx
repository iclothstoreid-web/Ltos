import type { BottleneckDashboard } from '@/lib/kpi/types'
import { STAGE_LABELS } from '@/lib/production/stageConfig'
import type { ProductionStage } from '@/lib/production/types'

// Renders get_bottleneck_dashboard() as-is (Sprint E) -- no new RPC, no
// client-side recomputation of its picks.
export function BottleneckSummary({ data }: { data: BottleneckDashboard }) {
  const stageLabel = (stage: string | null) =>
    stage ? STAGE_LABELS[stage as ProductionStage] || stage : '—'

  // toLocaleString('id-ID') for consistency with every other number on this
  // page (KpiCard/OperatorStatCard already use it) -- raw template-literal
  // interpolation renders a period decimal ("133.3%"), found inconsistent
  // with the comma-decimal used elsewhere ("47,6%") during visual review.
  const pct = (value: number | null) => (value != null ? value.toLocaleString('id-ID', { maximumFractionDigits: 1 }) : null)
  const hours = (value: number | null) => (value != null ? value.toLocaleString('id-ID', { maximumFractionDigits: 1 }) : null)

  const items: Array<{ label: string; value: string; detail: string | null }> = [
    {
      label: 'Stage Paling Lambat',
      value: stageLabel(data.slowest_stage),
      detail: hours(data.slowest_stage_avg_hours) != null ? `${hours(data.slowest_stage_avg_hours)} jam rata-rata` : null,
    },
    {
      label: 'Stage Paling Menumpuk',
      value: stageLabel(data.most_backlogged_stage),
      detail: data.most_backlogged_stage_count != null ? `${data.most_backlogged_stage_count} order` : null,
    },
    {
      label: 'Operator Tersibuk',
      value: data.busiest_operator || '—',
      detail: pct(data.busiest_operator_utilization_pct) != null ? `${pct(data.busiest_operator_utilization_pct)}% utilisasi` : null,
    },
    {
      label: 'Operator Paling Idle',
      value: data.most_idle_operator || '—',
      detail:
        pct(data.most_idle_operator_utilization_pct) != null ? `${pct(data.most_idle_operator_utilization_pct)}% utilisasi` : null,
    },
  ]

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Bottleneck</h2>
        <p className="text-body text-secondary">Titik lambat produksi saat ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.label} className="rounded-xl border border-outline-variant bg-surface/40 px-5 py-4">
            <p className="text-label text-secondary uppercase tracking-widest">{item.label}</p>
            <p className="text-body font-medium text-on-surface mt-2 truncate">{item.value}</p>
            {item.detail && <p className="text-body text-secondary mt-1">{item.detail}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
