import { SummaryCards } from './SummaryCards'
import { LowStockNotice } from './LowStockNotice'
import { ReservedNotice } from './ReservedNotice'
import { ActivityTimeline, type ActivityItem } from './ActivityTimeline'
import { MaterialIntelligencePanel } from './MaterialIntelligencePanel'
import type { MaterialAttentionItem, MaterialUsageRanking } from '@/lib/inventory/types'

export interface InventoryDashboardProps {
  totalMaterial: number
  totalItem: number
  stokMenipisCount: number
  reservedTotal: number
  reservedOrderCount: number
  activityItems: ActivityItem[]
  attentionList: MaterialAttentionItem[]
  mostUsedMaterials: MaterialUsageRanking[]
}

export function InventoryDashboard({
  totalMaterial,
  totalItem,
  stokMenipisCount,
  reservedTotal,
  reservedOrderCount,
  activityItems,
  attentionList,
  mostUsedMaterials,
}: InventoryDashboardProps) {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-headline text-on-surface">Inventory Hub Workspace</h1>
        <p className="text-body text-secondary mt-1">Ringkasan material Tarda hari ini.</p>
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

      <MaterialIntelligencePanel attentionList={attentionList} mostUsedMaterials={mostUsedMaterials} />

      <ActivityTimeline items={activityItems} />
    </div>
  )
}
