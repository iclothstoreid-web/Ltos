'use client'

import { useMemo, useState } from 'react'
import { LeftSidebar } from '@/components/command-center/OwnerCommandCenter/LeftSidebar'
import { OwnerTopBar } from '@/components/command-center/OwnerCommandCenter/OwnerTopBar'
import { PerOrderList, type OrderSummary } from './PerOrderList'
import { PerStageList, type StageOrderSummary } from './PerStageList'
import { CommunicationThread } from './CommunicationThread'
import type { CommunicationMessage } from '@/lib/communication/types'
import type { ProductionStage } from '@/lib/production/types'

type ViewMode = 'per_order' | 'per_stage'

interface CommunicationsCenterProps {
  profileId: string
  profileName: string
  orders: OrderSummary[]
  stageGroups: Record<ProductionStage, StageOrderSummary[]>
  initialMessages: CommunicationMessage[]
}

// Owner OS's two ways of seeing communication (per the locked architecture
// brief): Per Order and Per Stage. Both read the exact same `messages`
// array held here — Per Stage is purely a different left-side filter over
// it, never a second fetch or a second store.
export function CommunicationsCenter({ profileId, profileName, orders, stageGroups, initialMessages }: CommunicationsCenterProps) {
  const [mode, setMode] = useState<ViewMode>('per_order')
  const [messages, setMessages] = useState<CommunicationMessage[]>(initialMessages)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id ?? null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const selectedOrderLabel = useMemo(() => {
    const order = orders.find(o => o.id === selectedOrderId)
    return order ? `${order.orderNumber} — ${order.customerName}` : ''
  }, [orders, selectedOrderId])

  function handleMessageSent(message: CommunicationMessage) {
    setMessages(prev => [...prev, message])
  }

  return (
    <div className="min-h-screen bg-surface-01 text-text-primary flex atelier-bg">
      <LeftSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopBar profileName={profileName} onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-6 md:px-10 py-8 max-w-[1440px] w-full mx-auto flex flex-col min-h-0">
          <div className="mb-6">
            <h1 className="font-serif text-headline text-on-surface font-normal">Komunikasi</h1>
            <p className="text-body text-secondary mt-1">
              Satu thread komunikasi per Order, dilihat per Order atau per Stage operasional.
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('per_order')}
              className={`px-4 py-2 text-label uppercase tracking-widest rounded-[10px] border transition-colors ${
                mode === 'per_order'
                  ? 'border-primary bg-primary/10 text-on-surface'
                  : 'border-outline-variant/90 text-secondary hover:text-on-surface'
              }`}
            >
              Per Order
            </button>
            <button
              type="button"
              onClick={() => setMode('per_stage')}
              className={`px-4 py-2 text-label uppercase tracking-widest rounded-[10px] border transition-colors ${
                mode === 'per_stage'
                  ? 'border-primary bg-primary/10 text-on-surface'
                  : 'border-outline-variant/90 text-secondary hover:text-on-surface'
              }`}
            >
              Per Stage
            </button>
          </div>

          <div className="flex-1 min-h-[560px] grid grid-cols-1 lg:grid-cols-12 gap-6 border border-outline-variant/80 rounded-[14px] overflow-hidden bg-surface">
            <div className="lg:col-span-4 border-r border-outline-variant/80 flex flex-col min-h-0">
              {mode === 'per_order' ? (
                <PerOrderList orders={orders} messages={messages} selectedOrderId={selectedOrderId} onSelect={setSelectedOrderId} />
              ) : (
                <PerStageList stageGroups={stageGroups} messages={messages} selectedOrderId={selectedOrderId} onSelect={setSelectedOrderId} />
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col min-h-0">
              {selectedOrderId ? (
                <CommunicationThread
                  orderId={selectedOrderId}
                  orderLabel={selectedOrderLabel}
                  messages={messages}
                  profileId={profileId}
                  profileName={profileName}
                  onMessageSent={handleMessageSent}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-body text-secondary">
                  Pilih order untuk melihat komunikasi.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
