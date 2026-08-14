import type { DashboardMetric } from '@/lib/analytics/dashboardData'

interface KpiCardProps {
  label: string
  metric: DashboardMetric<number>
  format?: 'number' | 'currency' | 'percent'
}

function formatValue(value: number, format: KpiCardProps['format']): string {
  if (format === 'currency') return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
  if (format === 'percent') return `${value.toFixed(1)}%`
  return new Intl.NumberFormat('id-ID').format(value)
}

// Sprint W9-1 §12 — reusable KPI tile. Renders a real number when
// `metric.available` is true, or an honest "not connected yet" state
// otherwise — never a placeholder number standing in for real data (see
// dashboardData.ts's own comment for why some metrics are unavailable).
export function KpiCard({ label, metric, format = 'number' }: KpiCardProps) {
  return (
    <div className="border-[0.5px] border-[#c4c7c7] bg-white p-4">
      <p className="text-xs uppercase tracking-widest text-[#444748]">{label}</p>
      {metric.available && metric.value !== null ? (
        <p className="mt-2 font-fraunces text-2xl text-[#151c27]">{formatValue(metric.value, format)}</p>
      ) : (
        <div className="mt-2">
          <p className="font-fraunces text-2xl text-[#c4c7c7]">—</p>
          <p className="mt-1 text-[11px] leading-snug text-[#755b00]">{metric.unavailableReason ?? 'Data belum tersedia'}</p>
        </div>
      )}
    </div>
  )
}
