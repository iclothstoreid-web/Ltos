'use client'

import type { CommercialAlertCardData } from '@/lib/decision/types'
import { formatRupiah } from '@/lib/format/money'

interface CommercialAlertCardProps {
  data: CommercialAlertCardData
  onViewOutstanding: () => void
  onViewDiscounts: () => void
}

// Decision Card 2 — Commercial Alert
// Reuses Commercial Engine. All data composed client-side from
// getCommercialSummary() — no new RPC, no new engine.
export function CommercialAlertCard({
  data,
  onViewOutstanding,
  onViewDiscounts,
}: CommercialAlertCardProps) {
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
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-body font-medium text-on-surface">Outstanding Payment</p>
            <p className="text-label text-secondary">Total pembayaran belum diterima</p>
          </div>
          <span className="font-serif text-title text-[28px] leading-none text-[#c0392b] tabular-nums">
            {formatRupiah(data.outstandingPayment)}
          </span>
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
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-body font-medium text-on-surface">Overdue Payment</p>
            <p className="text-label text-secondary">Pembayaran melewati jatuh tempo</p>
          </div>
          <span className="font-serif text-title text-[28px] leading-none text-[#c0392b] tabular-nums">
            {data.overdueCount}
          </span>
        </div>

        {/* High Discount & Override */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-body font-medium text-on-surface">Discount Tinggi</p>
            <div className="flex items-center gap-3">
              <span className="font-serif text-title text-[24px] leading-none text-[#b8860b] tabular-nums">
                {data.highDiscountCount}
              </span>
              {data.highDiscountCount > 0 && (
                <button
                  type="button"
                  onClick={onViewDiscounts}
                  className="text-label text-primary hover:text-on-surface uppercase tracking-widest transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                >
                  Lihat
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-body font-medium text-on-surface">Override Tinggi</p>
            <span className="font-serif text-title text-[24px] leading-none text-[#b8860b] tabular-nums">
              {data.highOverrideCount}
            </span>
          </div>

          {(data.outstandingPayment > 0 || data.dpOutstandingCount > 0) && (
            <button
              type="button"
              onClick={onViewOutstanding}
              className="mt-2 w-full py-2 px-4 rounded-[10px] bg-primary/10 text-primary text-label uppercase tracking-widest hover:bg-primary/20 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
            >
              Tinjau Outstanding Payment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

