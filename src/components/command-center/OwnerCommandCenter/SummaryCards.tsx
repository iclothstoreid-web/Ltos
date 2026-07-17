import { OrdersWaitingCard } from './cards/OrdersWaitingCard'
import { ProductionTodayCard } from './cards/ProductionTodayCard'
import { QCRequiredCard } from './cards/QCRequiredCard'
import { RevenueTodayCard } from './cards/RevenueTodayCard'


export function SummaryCards({
  ordersWaiting,
  productionToday,
  qcRequired,
  revenueToday,
}: {
  ordersWaiting: number
  productionToday: number
  qcRequired: number
  revenueToday: number
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

      <OrdersWaitingCard value={ordersWaiting} />
      <ProductionTodayCard value={productionToday} />
      <QCRequiredCard value={qcRequired} />
      <RevenueTodayCard value={revenueToday} />
    </div>
  )
}

