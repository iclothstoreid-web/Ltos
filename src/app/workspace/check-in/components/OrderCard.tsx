'use client'

import { QRCodeSVG } from 'qrcode.react'
import { buildProductionQrPayload } from '@/lib/order/qr'
import type { FitterOrder } from '../types'

interface OrderCardProps {
  order: FitterOrder
  onClick: () => void
}

// Same three-tone vocabulary as the "Produksi Selesai"/active tones already
// established in this file's own sibling badge (CustomerSearch's
// "Konsultasi Terakhir" status pill) — no new palette introduced.
const STATUS_BADGE_STYLE: Record<FitterOrder['status_category'], string> = {
  waiting: 'bg-[#c4c7c7]/25 text-[#444748]',
  in_progress: 'bg-[#e2e8f8] text-[#151c27]',
  completed: 'bg-[#fed488]/40 text-[#785a1a]',
}

// Order Monitoring's card (Task 1, polished in Task 2) — replaces the
// generic consultation row once a customer already has an order. Clicking
// opens Order Summary (read-only), never Consultation Review. QR mini
// reuses the exact same buildProductionQrPayload() payload already printed
// on SystemLogisticsCard/ProductionQrCard — not a new QR format, just a
// smaller render of it for at-a-glance recognition on this card.
export function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-white border border-[#c4c7c7]/30
                 transition-all duration-300 hover:bg-white/60 hover:border-[#c4c7c7]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-semibold text-[#151c27] truncate">{order.customer_name}</p>
          <p className="font-sans text-xs text-[#444748] mt-1 tracking-wide">{order.order_number}</p>
        </div>
        <div className="shrink-0 bg-white p-1 border border-[#c4c7c7]/40 rounded">
          <QRCodeSVG value={buildProductionQrPayload(order.id)} size={36} level="M" />
        </div>
      </div>

      <div className="mt-3">
        <span
          className={`inline-block text-[10px] px-2 py-1 rounded uppercase font-semibold tracking-widest whitespace-nowrap ${STATUS_BADGE_STYLE[order.status_category]}`}
        >
          {order.status_produksi}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#c4c7c7]/20">
        <span className="font-sans text-[10px] text-[#444748]">
          Estimasi: {order.estimasi || '—'}
        </span>
        <span className="font-sans text-[10px] text-[#444748]">
          {new Date(order.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
    </button>
  )
}
