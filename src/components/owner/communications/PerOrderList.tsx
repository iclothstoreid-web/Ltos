'use client'

import { useState } from 'react'
import type { CommunicationMessage } from '@/lib/communication/types'

export interface OrderSummary {
  id: string
  orderNumber: string
  currentState: string
  customerName: string
}

interface PerOrderListProps {
  orders: OrderSummary[]
  messages: CommunicationMessage[]
  selectedOrderId: string | null
  onSelect: (orderId: string) => void
}

function lastMessagePreview(messages: CommunicationMessage[], orderId: string): string {
  const thread = messages.filter(m => m.order_id === orderId)
  if (thread.length === 0) return 'Belum ada pesan'
  return thread[thread.length - 1].body
}

// "Komunikasi Per Order": pick any order, see its full cross-app thread.
// Search is client-side only — the order list itself is small (Owner OS
// scale), no separate query needed per keystroke.
export function PerOrderList({ orders, messages, selectedOrderId, onSelect }: PerOrderListProps) {
  const [query, setQuery] = useState('')

  const filtered = orders.filter(o => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-outline-variant/80">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cari order atau customer..."
          className="w-full bg-transparent border border-outline-variant/90 rounded-[14px] px-3 py-2 text-body text-on-surface placeholder:text-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="p-4 text-body text-secondary">Tidak ada order yang cocok.</p>
        )}
        {filtered.map(order => (
          <button
            key={order.id}
            type="button"
            onClick={() => onSelect(order.id)}
            className={`w-full text-left px-4 py-3 border-b border-outline-variant/40 transition-colors ${
              selectedOrderId === order.id ? 'bg-primary/10' : 'hover:bg-on-surface/4'
            }`}
          >
            <p className="text-body text-on-surface">{order.orderNumber}</p>
            <p className="text-label text-secondary mt-0.5">{order.customerName}</p>
            <p className="text-label text-secondary/70 mt-1 truncate">{lastMessagePreview(messages, order.id)}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
