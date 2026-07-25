'use client'

import type {
  OperationalAlertCardData,
  CommercialAlertCardData,
  InventoryAlertCardData,
  BusinessInsightCardData,
} from '@/lib/decision/types'
import { OperationalAlertCard } from './OperationalAlertCard'
import { CommercialAlertCard } from './CommercialAlertCard'
import { InventoryAlertCard } from './InventoryAlertCard'
import { BusinessInsightCard } from './BusinessInsightCard'

export interface DecisionCardsSectionProps {
  operationalAlert: OperationalAlertCardData
  commercialAlert: CommercialAlertCardData
  inventoryAlert: InventoryAlertCardData
  businessInsight: BusinessInsightCardData
  onSelectOrder: (orderId: string) => void
}

// Sprint N.1/N.2 — Actionable Decision Layer V1
// Four Decision Cards that answer "Apa yang harus saya lakukan hari ini?"
// with a reason, a recommended action, and a deep link per item. Every
// card reuses data from existing RPCs only — no new engine, no new RPC,
// no new dashboard. onSelectOrder opens the same OrderDetailModal
// BottleneckPanel/Decision Center already use (owned by OwnerCommandCenter).
export function DecisionCardsSection({
  operationalAlert,
  commercialAlert,
  inventoryAlert,
  businessInsight,
  onSelectOrder,
}: DecisionCardsSectionProps) {
  return (
    <section className="mb-10">
      <div className="mb-6">
        <h2 className="font-serif text-heading-sm text-text-primary leading-[1.2] font-normal">
          Owner Decision Layer
        </h2>
        <p className="text-body-md text-secondary mt-2 leading-relaxed max-w-[60ch]">
          Keputusan yang dapat langsung ditindaklanjuti hari ini — seluruh data berasal dari engine yang sudah ada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OperationalAlertCard data={operationalAlert} onSelectOrder={onSelectOrder} />

        <CommercialAlertCard data={commercialAlert} onSelectOrder={onSelectOrder} />

        <InventoryAlertCard data={inventoryAlert} />

        <BusinessInsightCard data={businessInsight} />
      </div>
    </section>
  )
}

