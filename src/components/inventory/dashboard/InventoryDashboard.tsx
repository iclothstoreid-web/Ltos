import { SummaryCards } from './SummaryCards'
import { LowStockNotice } from './LowStockNotice'
import { ReservedNotice } from './ReservedNotice'
import { ActivityTimeline, type ActivityItem } from './ActivityTimeline'

export interface InventoryDashboardProps {
  totalMaterial: number
  totalItem: number
  stokMenipisCount: number
  reservedTotal: number
  reservedOrderCount: number
  activityItems: ActivityItem[]
}

export function InventoryDashboard({
  totalMaterial,
  totalItem,
  stokMenipisCount,
  reservedTotal,
  reservedOrderCount,
  activityItems,
}: InventoryDashboardProps) {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-headline text-on-surface">Inventory Hub Workspace</h1>
        <p className="text-body text-secondary mt-1">Ringkasan material Local Tailor hari ini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockNotice count={stokMenipisCount} />
        <ReservedNotice reservedTotal={reservedTotal} orderCount={reservedOrderCount} />
      </div>

      <SummaryCards
        totalMaterial={totalMaterial}
        totalItem={totalItem}
        stokMenipis={stokMenipisCount}
        reservedMaterial={reservedTotal}
      />

      <ActivityTimeline items={activityItems} />
    </div>
  )
}
