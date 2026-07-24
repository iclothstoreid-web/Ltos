'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { KpiCard } from './cards/KpiCard'
import { OrderDetailModal } from './OrderDetailModal'
import { OperatorDetailModal } from '@/components/owner/kpi-operator/OperatorDetailModal'
import { OperatorStatCard } from '@/components/owner/kpi-operator/OperatorStatCard'
import { TodaysActionSection } from '@/components/owner/decision-center/TodaysActionSection'
import { CATEGORY_LABEL, CATEGORY_ORDER } from '@/components/owner/decision-center/BottleneckBoard'
import { PRIORITY_HEADING, PRIORITY_ORDER } from '@/components/owner/decision-center/BusinessPriorityBoard'
import { computeTodaysActions } from '@/lib/decision/actions'
import type { CommercialSummary } from '@/lib/commercial/summary'
import type { OwnerSummary, SlaRiskOrder } from '@/lib/decision/types'
import type { CapacityDashboard, DivisiKpiRow, KpiDashboard, OperatorKpiRow } from '@/lib/kpi/types'

export interface EngineOverviewSectionProps {
  commercial: CommercialSummary
  ownerSummary: OwnerSummary
  slaRiskOrders: SlaRiskOrder[]
  capacityDashboard: CapacityDashboard
  kpiDashboard: KpiDashboard
  operators: OperatorKpiRow[]
  divisiRows: DivisiKpiRow[]
}

function PillarHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <h3 className="text-label text-secondary uppercase tracking-[0.24em]">{title}</h3>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-body text-primary hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
      >
        {linkLabel} <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </div>
  )
}

// Sprint K "Dashboard Integration": the front door that answers "apa yang
// harus dilakukan Owner hari ini?" by surfacing the headline numbers from
// every engine already built this Sprint (Commercial, Decision Center,
// Performance, Capacity) plus Today's Action, reusing them as-is --
// Today's Action reuses computeTodaysActions()/TodaysActionSection verbatim
// (with an added optional Commercial signal, see lib/decision/actions.ts),
// SLA/Business Priority/Bottleneck counts are grouped client-side from the
// same get_sla_risk_orders() rows Decision Center already renders in full,
// and Operator/Division drill-down reuses OperatorDetailModal exactly as
// KPI Operator does. No new RPC, no new table, no re-derivation of any
// classification -- every full board (Outstanding list, SLA/Priority/
// Bottleneck boards, Operator/Divisi tables, Capacity Calendar) still lives
// only on its own dedicated page; this section links into them rather than
// re-rendering them here.
export function EngineOverviewSection({
  commercial,
  ownerSummary,
  slaRiskOrders,
  capacityDashboard,
  kpiDashboard,
  operators,
  divisiRows,
}: EngineOverviewSectionProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null)

  const todaysActions = computeTodaysActions(ownerSummary, { dpOutstandingCount: commercial.dpOutstandingCount })

  const priorityCounts = Object.fromEntries(
    PRIORITY_ORDER.map(level => [level, slaRiskOrders.filter(o => o.business_priority === level).length])
  ) as Record<(typeof PRIORITY_ORDER)[number], number>

  const bottleneckCounts = Object.fromEntries(
    CATEGORY_ORDER.map(category => [category, slaRiskOrders.filter(o => o.bottleneck_category === category).length])
  ) as Record<(typeof CATEGORY_ORDER)[number], number>
  const topBottleneck = CATEGORY_ORDER.filter(category => bottleneckCounts[category] > 0).sort(
    (a, b) => bottleneckCounts[b] - bottleneckCounts[a]
  )[0]

  const activeQueueCount = slaRiskOrders.filter(o => o.queue_position != null).length

  // "Perlu Perhatian Segera" -- the Priority -> Order -> Detail drill-down,
  // right on the Dashboard, without duplicating the full boards.
  const urgentOrders = slaRiskOrders
    .filter(o => o.business_priority === 'critical' || o.risk_level === 'over_sla')
    .sort((a, b) => a.hours_remaining - b.hours_remaining)
    .slice(0, 3)

  const rankedOperators = [...operators].sort((a, b) => (b.efficiency_pct ?? -1) - (a.efficiency_pct ?? -1))
  const topOperator = rankedOperators[0]

  const staffedDivisi = divisiRows.filter(row => row.jumlah_sdm > 0)
  const rankedDivisi = [...staffedDivisi].sort((a, b) => (b.avg_efficiency_pct ?? -1) - (a.avg_efficiency_pct ?? -1))
  const topDivisi = rankedDivisi[0]

  return (
    <section className="mb-10 space-y-10">
      <div>
        <p className="text-label text-secondary uppercase tracking-widest mb-3">Sprint K · Engine Overview</p>
        <TodaysActionSection actions={todaysActions} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <PillarHeader title="Commercial" href="/command-center/commercial" linkLabel="Commercial Center" />
          <div className="grid grid-cols-2 gap-4">
            <KpiCard label="Sales" value={commercial.sales} format="currency" />
            <KpiCard label="Cash Collected" value={commercial.cashCollected} format="currency" />
            <KpiCard label="Outstanding" value={commercial.outstandingPayment} format="currency" />
            <KpiCard label="DP Outstanding" value={commercial.dpOutstandingCount} />
          </div>
        </div>

        <div>
          <PillarHeader title="Capacity" href="/owner/business-rules/capacity" linkLabel="Capacity Calendar" />
          <div className="grid grid-cols-2 gap-4">
            <OperatorStatCard label="Total Capacity" value={capacityDashboard.total_capacity} />
            <OperatorStatCard label="Used" value={capacityDashboard.capacity_used} />
            <OperatorStatCard label="Remaining" value={capacityDashboard.remaining_capacity} />
            <OperatorStatCard label="Utilization" value={capacityDashboard.capacity_utilization_pct} suffix="%" />
          </div>
        </div>

        <div>
          <PillarHeader title="Decision Center" href="/command-center/decision-center" linkLabel="Decision Center" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            <OperatorStatCard label="Normal SLA" value={ownerSummary.sla_risk.total_on_track} />
            <OperatorStatCard label="Risk SLA" value={ownerSummary.sla_risk.total_risk} />
            <OperatorStatCard label="Over SLA" value={ownerSummary.sla_risk.total_over_sla} />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRIORITY_ORDER.map(level => (
              <OperatorStatCard key={level} label={PRIORITY_HEADING[level]} value={priorityCounts[level]} />
            ))}
          </div>
          <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-4 elev-1 mb-4">
            <p className="text-label text-secondary uppercase tracking-widest">Bottleneck Teratas</p>
            <p className="text-body font-medium text-on-surface mt-1">
              {topBottleneck ? `${CATEGORY_LABEL[topBottleneck]} (${bottleneckCounts[topBottleneck]} order)` : 'Tidak ada bottleneck saat ini'}
            </p>
            <p className="text-body text-secondary mt-1">{activeQueueCount} order dalam antrian aktif (Rekomendasi Antrian)</p>
          </div>

          {urgentOrders.length > 0 && (
            <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 overflow-hidden elev-1">
              <p className="px-5 py-3 text-label text-secondary uppercase tracking-widest border-b border-outline-variant/80">
                Perlu Perhatian Segera
              </p>
              <ul className="divide-y divide-outline-variant">
                {urgentOrders.map(order => (
                  <li key={order.order_id}>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.order_id)}
                      className="w-full text-left px-5 py-3 hover:bg-on-surface/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                    >
                      <p className="text-body font-medium text-on-surface truncate">{order.order_number}</p>
                      <p className="text-body text-secondary mt-0.5">{order.risk_label}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <PillarHeader title="Performance" href="/command-center/kpi-operator" linkLabel="KPI Operator" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <OperatorStatCard label="Order Aktif" value={kpiDashboard.total_order_aktif} />
            <OperatorStatCard label="Order Selesai" value={kpiDashboard.total_order_selesai} />
            <OperatorStatCard label="Throughput Hari Ini" value={kpiDashboard.throughput_hari_ini} suffix="order" />
            <OperatorStatCard
              label="Avg Production Time"
              value={kpiDashboard.average_production_time_days}
              suffix="hari"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-4 elev-1">
              <p className="text-label text-secondary uppercase tracking-widest">Operator KPI</p>
              {topOperator ? (
                <button
                  type="button"
                  onClick={() => setSelectedOperatorId(topOperator.operator_id)}
                  className="mt-1 block text-left text-body font-medium text-primary hover:text-on-surface truncate w-full focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                >
                  Top: {topOperator.nama}
                </button>
              ) : (
                <p className="mt-1 text-body text-secondary">Belum ada operator</p>
              )}
            </div>

            <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-4 elev-1">
              <p className="text-label text-secondary uppercase tracking-widest">Division KPI</p>
              <p className="mt-1 text-body font-medium text-on-surface truncate">
                {topDivisi ? `Top: ${topDivisi.divisi}` : 'Belum ada divisi'}
              </p>
            </div>

            <Link
              href="/command-center/kpi-fitter"
              className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-4 elev-1 hover:-translate-y-[1px] transition-all duration-200 block"
            >
              <p className="text-label text-secondary uppercase tracking-widest">Fitter KPI</p>
              <p className="mt-1 text-body font-medium text-primary">Lihat KPI Fitter →</p>
            </Link>
          </div>
        </div>
      </div>

      {selectedOrderId && <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
      {selectedOperatorId && (
        <OperatorDetailModal operatorId={selectedOperatorId} onClose={() => setSelectedOperatorId(null)} />
      )}
    </section>
  )
}
