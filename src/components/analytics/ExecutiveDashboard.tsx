import { KpiCard } from './KpiCard'
import type { ExecutiveKpis } from '@/lib/analytics/dashboardData'

interface ExecutiveDashboardProps {
  kpis: ExecutiveKpis
}

// Sprint W9-1 §12 — Executive Dashboard. visitors/measurements/
// conversionRate render an honest "not connected" state (GA4 Data API
// isn't wired up — see dashboardData.ts); orders/revenue/AOV/consultations
// are real, live Supabase-backed numbers.
export function ExecutiveDashboard({ kpis }: ExecutiveDashboardProps) {
  return (
    <section aria-labelledby="executive-dashboard-heading">
      <h2 id="executive-dashboard-heading" className="font-fraunces text-xl text-[#151c27]">
        Executive
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Visitors" metric={kpis.visitors} />
        <KpiCard label="Consultations" metric={kpis.consultations} />
        <KpiCard label="Measurements" metric={kpis.measurements} />
        <KpiCard label="Orders" metric={kpis.orders} />
        <KpiCard label="Revenue" metric={kpis.revenue} format="currency" />
        <KpiCard label="AOV" metric={kpis.aov} format="currency" />
        <KpiCard label="Conversion Rate" metric={kpis.conversionRate} format="percent" />
      </div>
    </section>
  )
}
