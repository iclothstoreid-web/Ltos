'use client'

import type {
  OperationalAlertCardData,
  CommercialAlertCardData,
  InventoryAlertCardData,
  BusinessInsightCardData,
} from '@/lib/decision/types'
import type { SlaRiskOrder } from '@/lib/decision/types'
import { OperationalAlertCard } from './OperationalAlertCard'
import { CommercialAlertCard } from './CommercialAlertCard'
import { InventoryAlertCard } from './InventoryAlertCard'
import { BusinessInsightCard } from './BusinessInsightCard'

export interface DecisionCardsSectionProps {
  operationalAlert: OperationalAlertCardData
  commercialAlert: CommercialAlertCardData
  inventoryAlert: InventoryAlertCardData
  businessInsight: BusinessInsightCardData
  slaRiskOrders: SlaRiskOrder[]
  onSelectOrder: (orderId: string) => void
}

// Sprint N.1 — Owner Decision Layer V1
// Four Decision Cards that answer "Apa yang harus saya lakukan hari ini?"
// Every card reuses data from existing RPCs only — no new engine, no new
// RPC, no new dashboard.
export function DecisionCardsSection({
  operationalAlert,
  commercialAlert,
  inventoryAlert,
  businessInsight,
  slaRiskOrders,
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
        <OperationalAlertCard
          data={operationalAlert}
          onViewOrdersOverSla={() => {
            const overSla = slaRiskOrders.find(o => o.risk_level === 'over_sla')
            if (overSla) onSelectOrder(overSla.order_id)
          }}
          onViewOrdersNearSla={() => {
            const nearSla = slaRiskOrders.find(o => o.risk_level === 'risk')
            if (nearSla) onSelectOrder(nearSla.order_id)
          }}
        />

        <CommercialAlertCard
          data={commercialAlert}
          onViewOutstanding={() => {
            // Opens first outstanding order detail
            onSelectOrder(slaRiskOrders[0]?.order_id || '')
          }}
          onViewDiscounts={() => {
            onSelectOrder(slaRiskOrders[0]?.order_id || '')
          }}
        />

        <InventoryAlertCard data={inventoryAlert} />

        <BusinessInsightCard data={businessInsight} />
      </div>
    </section>
  )
}

