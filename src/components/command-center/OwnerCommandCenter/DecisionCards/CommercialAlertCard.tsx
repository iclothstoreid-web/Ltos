'use client'

import type { CommercialAlertCardData, CommercialDecisionItem } from '@/lib/decision/types'
import { formatRupiah } from '@/lib/format/money'

interface CommercialAlertCardProps {
  data: CommercialAlertCardData
  onSelectOrder: (orderId: string) => void
}

function CommercialItemList({
  items,
  onSelectOrder,
}: {
  items: CommercialDecisionItem[]
  onSelectOrder: (orderId: string) => void
}) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map(item => (
        <li key={item.orderId}>
          <button
            type="button"
            onClick={() => onSelectOrder(item.orderId)}
            className="w-full text-left rounded-[8px] px-2 py-1.5 -mx-2 hover:bg-on-surface/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-body font-medium text-on-surface truncate">
                {item.orderNumber} · {item.customerName}
              </span>
              <span className="text-label text-secondary tabular-nums shrink-0">
                {formatRupiah(item.amount)}
              </span>
            </div>
            <p className="text-label text-secondary mt-0.5">{item.reason}</p>
          </button>
        </li>
      ))}
    </ul>
  )
}

// Decision Card 2 — Commercial Alert
// Reuses Commercial Engine. All data composed client-side from
// getCommercialSummary() — no new RPC, no new engine.
export function CommercialAlertCard({ data, onSelectOrder }: CommercialAlertCardProps) {
  return (
    <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 overflow-hidden elev-1 relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[repeating-linear-gradient(135deg,rgba(27,27,28,0.10)_0px,rgba(27,27,28,0.10)_1px,transparent_1px,transparent_9px)]" />

      <div className="relative px-6 py-5 border-b border-outline-variant/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#b8860b]" />
          <p className="text-label text-secondary uppercase tracking-[0.24em]">Commercial Alert</p>
        </div>
        <p className="text-body text-secondary mt-1">
          Reusing Commercial Engine
        </p>
      </div>

      <div className="relative divide-y divide-outline-variant/60">
        {/* Outstanding Payment */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-medium text-on-surface">Outstanding Payment</p>
              <p className="text-label text-secondary">Total pembayaran belum diterima</p>
            </div>
            <span className="font-serif text-title text-[28px] leading-none text-[#c0392b] tabular-nums">
              {formatRupiah(data.outstandingPayment)}
            </span>
          </div>
          {(data.agingBuckets.days0to7 > 0 ||
            data.agingBuckets.days8to14 > 0 ||
            data.agingBuckets.days15to30 > 0 ||
            data.agingBuckets.daysOver30 > 0) && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              <div className="rounded-[8px] bg-on-surface/5 px-2 py-1.5 text-center">
                <p className="text-label text-secondary uppercase tracking-widest text-[10px]">0-7 Hari</p>
                <p className="text-body font-medium text-on-surface tabular-nums">{data.agingBuckets.days0to7}</p>
              </div>
              <div className="rounded-[8px] bg-on-surface/5 px-2 py-1.5 text-center">
                <p className="text-label text-secondary uppercase tracking-widest text-[10px]">8-14 Hari</p>
                <p className="text-body font-medium text-on-surface tabular-nums">{data.agingBuckets.days8to14}</p>
              </div>
              <div className="rounded-[8px] bg-[#f3e6c8] px-2 py-1.5 text-center">
                <p className="text-label text-[#7a5a12] uppercase tracking-widest text-[10px]">15-30 Hari</p>
                <p className="text-body font-medium text-[#7a5a12] tabular-nums">{data.agingBuckets.days15to30}</p>
              </div>
              <div className="rounded-[8px] bg-[#f3d6d3] px-2 py-1.5 text-center">
                <p className="text-label text-[#8a2c22] uppercase tracking-widest text-[10px]">&gt;30 Hari</p>
                <p className="text-body font-medium text-[#8a2c22] tabular-nums">{data.agingBuckets.daysOver30}</p>
              </div>
            </div>
          )}
          {data.outstandingItems.length > 0 && (
            <CommercialItemList items={data.outstandingItems} onSelectOrder={onSelectOrder} />
          )}
        </div>

        {/* DP Outstanding */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-body font-medium text-on-surface">DP Outstanding</p>
            <p className="text-label text-secondary">Order belum bayar DP</p>
          </div>
          <span className="font-serif text-title text-[28px] leading-none text-[#b8860b] tabular-nums">
            {data.dpOutstandingCount}
          </span>
        </div>

        {/* Overdue Payment */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-medium text-on-surface">Overdue Payment</p>
              <p className="text-label text-secondary">Outstanding pada order yang sudah melewati SLA</p>
            </div>
            <span className="font-serif text-title text-[28px] leading-none text-[#c0392b] tabular-nums">
              {data.overdueCount}
            </span>
          </div>
          {data.overdueItems.length > 0 && (
            <CommercialItemList items={data.overdueItems} onSelectOrder={onSelectOrder} />
          )}
        </div>

        {/* Discount Tinggi */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-body font-medium text-on-surface">Discount Tinggi</p>
            <span className="font-serif text-title text-[24px] leading-none text-[#b8860b] tabular-nums">
              {data.highDiscountCount}
            </span>
          </div>
          {data.highDiscountItems.length > 0 && (
            <CommercialItemList items={data.highDiscountItems} onSelectOrder={onSelectOrder} />
          )}
        </div>

        {/* Override Tinggi */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-body font-medium text-on-surface">Override Tinggi</p>
            <span className="font-serif text-title text-[24px] leading-none text-[#b8860b] tabular-nums">
              {data.highOverrideCount}
            </span>
          </div>
          {data.highOverrideItems.length > 0 && (
            <CommercialItemList items={data.highOverrideItems} onSelectOrder={onSelectOrder} />
          )}
        </div>
      </div>
    </div>
  )
}

