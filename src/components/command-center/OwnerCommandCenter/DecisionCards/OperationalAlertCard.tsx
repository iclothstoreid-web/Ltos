'use client'

import type { OperationalAlertCardData } from '@/lib/decision/types'
import { STAGE_LABELS } from '@/lib/production/stageConfig'
import type { ProductionStage } from '@/lib/production/types'

interface OperationalAlertCardProps {
  data: OperationalAlertCardData
  onViewOrdersOverSla: () => void
  onViewOrdersNearSla: () => void
}

// Decision Card 1 — Operational Alert
// Reuses Queue Engine (SLA risk), Production Runtime (bottleneck), Capacity
// (operator overload). All data is composed client-side from existing RPC
// responses — no new engine, no new RPC, no new dashboard.
export function OperationalAlertCard({
  data,
  onViewOrdersOverSla,
  onViewOrdersNearSla,
}: OperationalAlertCardProps) {
  const bottleneckLabel = data.bottleneckStage
    ? STAGE_LABELS[data.bottleneckStage as ProductionStage] || data.bottleneckStage
    : null

  return (
    <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 overflow-hidden elev-1 relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[repeating-linear-gradient(135deg,rgba(27,27,28,0.10)_0px,rgba(27,27,28,0.10)_1px,transparent_1px,transparent_9px)]" />

      <div className="relative px-6 py-5 border-b border-outline-variant/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c0392b] animate-pulse" />
          <p className="text-label text-secondary uppercase tracking-[0.24em]">Operational Alert</p>
        </div>
        <p className="text-body text-secondary mt-1">
          Reusing Queue Engine · Production Runtime · Capacity
        </p>
      </div>

      <div className="relative divide-y divide-outline-variant/60">
        {/* Orders over SLA */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-body font-medium text-on-surface">Order Melewati SLA</p>
            <p className="text-label text-secondary">Perlu tindakan segera</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-serif text-title text-[28px] leading-none text-[#c0392b]">
              {data.ordersOverSla}
            </span>
            {data.ordersOverSla > 0 && (
              <button
                type="button"
                onClick={onViewOrdersOverSla}
                className="text-label text-primary hover:text-on-surface uppercase tracking-widest transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
              >
                Lihat
              </button>
            )}
          </div>
        </div>

        {/* Orders near SLA */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-body font-medium text-on-surface">Order Mendekati SLA</p>
            <p className="text-label text-secondary">Perlu dipantau</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-serif text-title text-[28px] leading-none text-[#b8860b]">
              {data.ordersNearSla}
            </span>
            {data.ordersNearSla > 0 && (
              <button
                type="button"
                onClick={onViewOrdersNearSla}
                className="text-label text-primary hover:text-on-surface uppercase tracking-widest transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
              >
                Lihat
              </button>
            )}
          </div>
        </div>

        {/* Bottleneck */}
        <div className="px-6 py-4">
          <p className="text-body font-medium text-on-surface">Bottleneck</p>
          <p className="text-body text-secondary mt-1">
            {bottleneckLabel
              ? `${bottleneckLabel} (${data.bottleneckCount ?? 0} order menumpuk)`
              : 'Tidak ada bottleneck saat ini'}
          </p>
        </div>

        {/* Operator Overload */}
        <div className="px-6 py-4">
          <p className="text-body font-medium text-on-surface">Operator Overload</p>
          {data.operatorOverload.length === 0 ? (
            <p className="text-body text-secondary mt-1">Tidak ada operator kelebihan kapasitas</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {data.operatorOverload.slice(0, 4).map(op => (
                <li key={op.operator_id} className="flex items-center justify-between">
                  <span className="text-body text-secondary truncate">{op.nama}</span>
                  <span className="text-label text-secondary tabular-nums">
                    {op.utilization_pct}% · {op.active_jobs}/{op.max_concurrent_capacity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

