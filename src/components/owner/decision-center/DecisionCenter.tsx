'use client'

import { useMemo, useState } from 'react'
import { LeftSidebar } from '@/components/command-center/OwnerCommandCenter/LeftSidebar'
import { OwnerTopBar } from '@/components/command-center/OwnerCommandCenter/OwnerTopBar'
import { OrderDetailModal } from '@/components/command-center/OwnerCommandCenter/OrderDetailModal'
import { OperatorDetailModal } from '@/components/owner/kpi-operator/OperatorDetailModal'
import { BottleneckSummary } from '@/components/owner/kpi-operator/BottleneckSummary'
import type { OwnerSummary, SlaRiskOrder } from '@/lib/decision/types'
import type { OperatorKpiRow } from '@/lib/kpi/types'
import { computeTodaysActions } from '@/lib/decision/actions'
import { PriorityTodaySection } from './PriorityTodaySection'
import { OperatorAttentionSection } from './OperatorAttentionSection'
import { ServiceAvailabilitySection } from './ServiceAvailabilitySection'
import { TodaysActionSection } from './TodaysActionSection'

export type DecisionCenterProps = {
  profileName: string
  ownerSummary: OwnerSummary
  slaRiskOrders: SlaRiskOrder[]
  operators: OperatorKpiRow[]
}

// Owner OS's "Decision Center" (Sprint I). Same chrome as
// OwnerCommandCenter/KpiOperatorCenter -- this page composes the brief's
// five sections entirely from data three existing RPCs already fetched
// server-side (get_owner_summary, get_sla_risk_orders, get_operator_kpi_list).
// Nothing here recomputes SLA/capacity/bottleneck signals, it only groups
// and displays them, reusing OrderDetailModal / OperatorDetailModal /
// BottleneckSummary verbatim rather than rebuilding "click row -> open
// detail" a third time.
export function DecisionCenter({ profileName, ownerSummary, slaRiskOrders, operators }: DecisionCenterProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null)

  const todaysActions = useMemo(() => computeTodaysActions(ownerSummary), [ownerSummary])

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-surface-01 text-text-primary flex atelier-bg">
      <LeftSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopBar profileName={profileName} onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-10 max-w-[1440px] w-full mx-auto space-y-10">
          <section>
            <p className="text-label text-secondary uppercase tracking-widest mb-3">Decision Center · {todayLabel}</p>
            <h1 className="font-serif text-heading-md text-text-primary leading-[1.2] font-normal">
              Apa yang harus saya lakukan hari ini?
            </h1>
            <p className="text-body-md text-secondary mt-3 leading-relaxed max-w-[60ch]">
              Prioritas order, operator yang butuh perhatian, titik lambat produksi, dan ketersediaan layanan — semua
              dalam satu layar.
            </p>
          </section>

          <PriorityTodaySection orders={slaRiskOrders} onSelectOrder={setSelectedOrderId} />

          <OperatorAttentionSection operators={operators} onSelectOperator={setSelectedOperatorId} />

          <BottleneckSummary data={ownerSummary.bottleneck} />

          <ServiceAvailabilitySection data={ownerSummary.service_availability} />

          <TodaysActionSection actions={todaysActions} />
        </main>
      </div>

      {selectedOrderId && <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
      {selectedOperatorId && (
        <OperatorDetailModal operatorId={selectedOperatorId} onClose={() => setSelectedOperatorId(null)} />
      )}
    </div>
  )
}
