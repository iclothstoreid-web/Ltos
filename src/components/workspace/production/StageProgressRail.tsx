'use client'

import { memo } from 'react'
import type { ProductionStage, StageRecord } from '@/lib/production/types'
import { STAGE_LABELS, STAGE_ORDER } from '@/lib/production/stageConfig'

interface StageProgressRailProps {
  stageRecords: StageRecord[]
  currentStage: ProductionStage
  variant?: 'horizontal' | 'vertical'
}

function latestStatusFor(stageRecords: StageRecord[], stage: ProductionStage) {
  const records = stageRecords.filter(r => r.stage === stage)
  if (records.length === 0) return 'pending' as const
  return records.sort((a, b) => b.attempt - a.attempt)[0].status
}

// PR-03 (Rendering Performance) — memoized: props are stable references
// derived from `packet` in the parent, so this now skips re-render on
// unrelated keystrokes (notes/courier/etc). Same API, same behavior.
function StageProgressRailComponent({
  stageRecords,
  currentStage,
  variant = 'horizontal',
}: StageProgressRailProps) {
  if (variant === 'vertical') {
    return (
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30">
        <h3 className="font-caslon text-xl text-on-surface mb-6">Alur Produksi</h3>
        <div className="space-y-0 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-outline-variant" />
          {STAGE_ORDER.map((stage, i) => {
            const status = latestStatusFor(stageRecords, stage)
            const isCurrent = stage === currentStage
            return (
              <div
                key={stage}
                className={`flex items-start gap-4 relative ${i < STAGE_ORDER.length - 1 ? 'pb-8' : ''} ${
                  status === 'pending' && !isCurrent ? 'opacity-40' : ''
                }`}
              >
                <div
                  className={`z-10 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 ${
                    status === 'completed'
                      ? 'bg-on-surface'
                      : isCurrent
                        ? 'bg-white border-2 border-on-surface'
                        : 'bg-white border-2 border-outline-variant'
                  }`}
                >
                  {status === 'completed' && <span className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-hanken font-semibold leading-tight ${
                      isCurrent ? 'text-on-surface' : status === 'completed' ? 'text-on-surface' : 'text-secondary/80'
                    }`}
                  >
                    {STAGE_LABELS[stage]}
                  </p>
                  {isCurrent && (
                    <p className="font-jetbrains text-[10px] tracking-widest text-amber-mid font-bold uppercase">
                      Aktif
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {STAGE_ORDER.map((stage, i) => {
        const status = latestStatusFor(stageRecords, stage)
        const isCurrent = stage === currentStage
        const dotClasses =
          status === 'completed'
            ? 'bg-on-surface'
            : isCurrent
              ? 'bg-white border-2 border-on-surface'
              : 'bg-surface-container border-2 border-outline-variant'

        return (
          <div key={stage} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1 w-16">
              <div className={`w-4 h-4 rounded-full ${dotClasses}`} />
              <p
                className={`font-hanken text-[8px] uppercase tracking-wide text-center leading-tight ${
                  isCurrent ? 'text-on-surface font-semibold' : 'text-secondary/60'
                }`}
              >
                {STAGE_LABELS[stage]}
              </p>
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <div className="w-4 h-[1px] bg-outline-variant -mt-4" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export const StageProgressRail = memo(StageProgressRailComponent)
