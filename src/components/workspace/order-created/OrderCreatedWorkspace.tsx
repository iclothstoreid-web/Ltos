'use client'

import type { Order } from '@/types'
import type { OrderSnapshot } from '@/lib/order/types'
import type { CommunicationMessage } from '@/lib/communication/types'
import { TopNavBar } from './TopNavBar'
import { CustomerOrderCard } from './CustomerOrderCard'
import { PaymentSummaryCard } from './PaymentSummaryCard'
import { OrderSuccessHero } from './OrderSuccessHero'
import { CustomerJourneyShareActions } from './CustomerJourneyShareActions'
import { TechnicalDetailsCard } from './TechnicalDetailsCard'
import { ProductionJourneyTimeline } from './ProductionJourneyTimeline'
import { SystemLogisticsCard } from './SystemLogisticsCard'
import { OrderCommunicationPanel } from './OrderCommunicationPanel'
import { OrderCreatedFooter } from './OrderCreatedFooter'

interface OrderCreatedWorkspaceProps {
  order: Order
  snapshot: OrderSnapshot
  orderCreatedAt: string
  timelineEvents: { event_type: string; created_at: string }[]
  fitterName: string
  profileId: string
  initialMessages: CommunicationMessage[]
}

export function OrderCreatedWorkspace({
  order,
  snapshot,
  timelineEvents,
  fitterName,
  profileId,
  initialMessages,
}: OrderCreatedWorkspaceProps) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#151c27] pb-32">
      <TopNavBar fitterInitial={fitterName.charAt(0).toUpperCase()} />

      <main className="max-w-[1440px] mx-auto px-16 py-16 grid grid-cols-12 gap-8">
        <aside className="col-span-3 flex flex-col gap-8">
          <CustomerOrderCard
            customerName={snapshot.customer.name}
            customerId={snapshot.customer.id}
            isPreferred={snapshot.customer.isPreferredClient}
            orderNumber={order.order_number}
          />
          <PaymentSummaryCard />
        </aside>

        <div className="col-span-5 flex flex-col gap-8">
          <OrderSuccessHero orderNumber={order.order_number} snapshot={snapshot} />
          <CustomerJourneyShareActions
            customerToken={order.customer_token}
            customerName={snapshot.customer.name}
            customerPhone={snapshot.customer.phone}
            orderNumber={order.order_number}
          />
        </div>

        <aside className="col-span-4 flex flex-col gap-8">
          <TechnicalDetailsCard design={snapshot.design} />
          <ProductionJourneyTimeline events={timelineEvents} />
          <SystemLogisticsCard orderId={order.id} orderNumber={order.order_number} />
        </aside>
      </main>

      <section className="max-w-[1440px] mx-auto px-16 pb-16">
        <OrderCommunicationPanel
          orderId={order.id}
          profileId={profileId}
          profileName={fitterName}
          initialMessages={initialMessages}
        />
      </section>

      <OrderCreatedFooter orderNumber={order.order_number} />
    </div>
  )
}
