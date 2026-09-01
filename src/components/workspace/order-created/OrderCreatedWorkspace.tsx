'use client'

import type { Order } from '@/types'
import type { OrderSnapshot } from '@/lib/order/types'
import type { CommunicationMessage } from '@/lib/communication/types'
import { TopNavBar } from './TopNavBar'
import { WorkspaceCustomerHeader } from '@/components/workspace/WorkspaceCustomerHeader'
import { PaymentSummaryCard } from './PaymentSummaryCard'
import { OrderSuccessHero } from './OrderSuccessHero'
import { CustomerJourneyShareActions } from './CustomerJourneyShareActions'
import { TechnicalDetailsCard } from './TechnicalDetailsCard'
import { ProductionJourneyTimeline } from './ProductionJourneyTimeline'
import { SystemLogisticsCard } from './SystemLogisticsCard'
import { OrderCommunicationPanel } from './OrderCommunicationPanel'
import { OrderCreatedFooter } from './OrderCreatedFooter'
import { TransactionGarmentsPanel } from './TransactionGarmentsPanel'
import { OrderProductionPrintSheet } from './OrderProductionPrintSheet'

interface OrderCreatedWorkspaceProps {
  order: Order
  snapshot: OrderSnapshot
  orderCreatedAt: string
  timelineEvents: { event_type: string; created_at: string }[]
  fitterName: string
  profileId: string
  initialMessages: CommunicationMessage[]
  // Milestone B (Multi-Garment) — every order belongs to exactly one
  // transaction since Milestone A, so this is never null in practice.
  transactionId: string
}

export function OrderCreatedWorkspace({
  order,
  snapshot,
  timelineEvents,
  fitterName,
  profileId,
  initialMessages,
  transactionId,
}: OrderCreatedWorkspaceProps) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#151c27] pb-32">
      <TopNavBar fitterInitial={fitterName.charAt(0).toUpperCase()} />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-8">
        <WorkspaceCustomerHeader
          customerName={snapshot.customer.name}
          isPreferred={snapshot.customer.isPreferredClient}
          fitterName={fitterName}
          identifiers={[
            { label: 'Customer', value: `#${snapshot.customer.id.slice(0, 8).toUpperCase()}` },
            { label: 'Order', value: order.order_number },
          ]}
        />
      </div>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        <div className="lg:col-span-7 flex flex-col gap-8 min-w-0">
          <OrderSuccessHero orderNumber={order.order_number} snapshot={snapshot} />
          <CustomerJourneyShareActions
            customerToken={order.customer_token}
            customerName={snapshot.customer.name}
            customerPhone={snapshot.customer.phone}
            orderNumber={order.order_number}
          />
        </div>

        <aside className="lg:col-span-5 flex flex-col gap-8">
          <PaymentSummaryCard orderId={order.id} priceSnapshot={snapshot.designSpecification?.priceSnapshot ?? null} />
          <TechnicalDetailsCard design={snapshot.design} />
          <ProductionJourneyTimeline events={timelineEvents} />
          <SystemLogisticsCard orderId={order.id} orderNumber={order.order_number} />
        </aside>
      </main>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pb-16">
        <h2 className="font-sans text-xs font-bold text-[#151c27] uppercase tracking-widest mb-4">
          Transaksi & Garmen Lain
        </h2>
        <TransactionGarmentsPanel transactionId={transactionId} currentOrderId={order.id} />
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pb-16">
        <OrderCommunicationPanel
          orderId={order.id}
          profileId={profileId}
          profileName={fitterName}
          initialMessages={initialMessages}
        />
      </section>

      <OrderCreatedFooter orderNumber={order.order_number} />

      {/* Print-only — portals to <body>; `Cetak Lembar Produksi` in
          SystemLogisticsCard fires window.print() and only this renders. */}
      <OrderProductionPrintSheet
        orderId={order.id}
        orderNumber={order.order_number}
        customerName={snapshot.customer.name}
        design={snapshot.design}
      />
    </div>
  )
}
