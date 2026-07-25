'use client'

import type { BusinessInsightCardData } from '@/lib/decision/types'

interface BusinessInsightCardProps {
  data: BusinessInsightCardData
}

// Decision Card 4 — Business Insight
// Reuses KPI. All data composed client-side from getKpiDashboard() and
// slaRiskOrders — no new RPC, no new engine.
export function BusinessInsightCard({ data }: BusinessInsightCardProps) {
  const completionRateDisplay =
    data.completionRate != null
      ? `${Math.round(data.completionRate * 100)}%`
      : '—'

  return (
    <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 overflow-hidden elev-1 relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[repeating-linear-gradient(135deg,rgba(27,27,28,0.10)_0px,rgba(27,27,28,0.10)_1px,transparent_1px,transparent_9px)]" />

      <div className="relative px-6 py-5 border-b border-outline-variant/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <p className="text-label text-secondary uppercase tracking-[0.24em]">Business Insight</p>
        </div>
        <p className="text-body text-secondary mt-1">
          Reusing KPI
        </p>
      </div>

      <div className="relative grid grid-cols-2 divide-x divide-outline-variant/60">
        {/* Completion Rate */}
        <div className="px-6 py-4">
          <p className="text-body font-medium text-on-surface">Completion Rate</p>
          <p className="text-label text-secondary mt-0.5">Order selesai vs total</p>
          <p className="font-serif text-title text-[36px] leading-none text-primary mt-2 tabular-nums">
            {completionRateDisplay}
          </p>
        </div>

        {/* Repeat Customer / QC Return */}
        <div className="px-6 py-4">
          <p className="text-body font-medium text-on-surface">QC Return</p>
          <p className="text-label text-secondary mt-0.5">Order dikembalikan ke produksi</p>
          <p className="font-serif text-title text-[36px] leading-none text-[#b8860b] mt-2 tabular-nums">
            {data.qcReturnCount}
          </p>
        </div>
      </div>

      <div className="relative divide-y divide-outline-variant/60">
        {/* Throughput Today */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-medium text-on-surface">Throughput Hari Ini</p>
              <p className="text-label text-secondary">Order selesai diproses</p>
            </div>
            <span className="font-serif text-title text-[28px] leading-none text-on-surface tabular-nums">
              {data.throughputHariIni}
            </span>
          </div>
        </div>

        {/* Throughput This Week */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-medium text-on-surface">Trend Minggu Ini</p>
              <p className="text-label text-secondary">Total throughput 7 hari</p>
            </div>
            <span className="font-serif text-title text-[28px] leading-none text-on-surface tabular-nums">
              {data.throughputMingguIni}
            </span>
          </div>
        </div>

        {/* Active vs Completed */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-body font-medium text-on-surface">Order Aktif</p>
            <span className="font-serif text-title text-[24px] leading-none text-on-surface tabular-nums">
              {data.activeOrders}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-body font-medium text-on-surface">Order Selesai</p>
            <span className="font-serif text-title text-[24px] leading-none text-on-surface tabular-nums">
              {data.completedOrders}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

