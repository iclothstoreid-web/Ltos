'use client'

import { STAGE_ORDER, STAGE_LABELS } from '@/lib/production/stageConfig'
import type { ProductionStage } from '@/lib/production/types'
import type { CommunicationMessage } from '@/lib/communication/types'

export interface StageOrderSummary {
  id: string
  orderNumber: string
  customerName: string
}

interface PerStageListProps {
  stageGroups: Record<ProductionStage, StageOrderSummary[]>
  messages: CommunicationMessage[]
  selectedOrderId: string | null
  onSelect: (orderId: string) => void
}

function lastMessagePreview(messages: CommunicationMessage[], orderId: string): string {
  const thread = messages.filter(m => m.order_id === orderId)
  if (thread.length === 0) return 'Belum ada pesan'
  return thread[thread.length - 1].body
}

// "Komunikasi Per Stage": for each of the 8 locked production stages, list
// every order currently sitting there (production_stage_records) plus its
// active communication. This never reads a separate store — stageGroups
// comes from a read-side join, and messages is the exact same array
// PerOrderList uses; grouping here is presentation only.
export function PerStageList({ stageGroups, messages, selectedOrderId, onSelect }: PerStageListProps) {
  return (
    <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/40">
      {STAGE_ORDER.map((stage: ProductionStage) => {
        const orders = stageGroups[stage]
        return (
          <div key={stage} className="px-4 py-4">
            <p className="text-label uppercase tracking-widest text-secondary mb-2">
              {STAGE_LABELS[stage]} <span className="text-secondary/60">({orders.length})</span>
            </p>
            {orders.length === 0 && <p className="text-label text-secondary/70">Tidak ada order aktif.</p>}
            <div className="space-y-1">
              {orders.map(order => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => onSelect(order.id)}
                  className={`w-full text-left px-3 py-2 rounded-[10px] transition-colors ${
                    selectedOrderId === order.id ? 'bg-primary/10' : 'hover:bg-on-surface/4'
                  }`}
                >
                  <p className="text-body text-on-surface">{order.orderNumber}</p>
                  <p className="text-label text-secondary mt-0.5">{order.customerName}</p>
                  <p className="text-label text-secondary/70 mt-0.5 truncate">{lastMessagePreview(messages, order.id)}</p>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
