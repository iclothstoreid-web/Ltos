'use client'

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

export function StageProgressRail({
  stageRecords,
  currentStage,
  variant = 'horizontal',
}: StageProgressRailProps) {
  if (variant === 'vertical') {
    return (
      <div className="bg-[#fbf9fc] rounded-2xl p-6 shadow-sm border border-[#c6c6cc]/30">
        <h3 className="font-caslon text-xl text-[#161b29] mb-6">Alur Produksi</h3>
        <div className="space-y-0 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-[#c6c6cc]" />
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
                      ? 'bg-[#161b29]'
                      : isCurrent
                        ? 'bg-white border-2 border-[#161b29]'
                        : 'bg-white border-2 border-[#c6c6cc]'
                  }`}
                >
                  {status === 'completed' && <span className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-hanken font-semibold leading-tight ${
                      isCurrent ? 'text-[#161b29]' : status === 'completed' ? 'text-[#161b29]' : 'text-[#76777d]'
                    }`}
                  >
                    {STAGE_LABELS[stage]}
                  </p>
                  {isCurrent && (
                    <p className="font-jetbrains text-[10px] tracking-widest text-[#755b00] font-bold uppercase">
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
            ? 'bg-[#151c27]'
            : isCurrent
              ? 'bg-white border-2 border-[#151c27]'
              : 'bg-[#dce2f3] border-2 border-[#c4c7c7]'

        return (
          <div key={stage} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1 w-16">
              <div className={`w-4 h-4 rounded-full ${dotClasses}`} />
              <p
                className={`font-sans text-[8px] uppercase tracking-wide text-center leading-tight ${
                  isCurrent ? 'text-[#151c27] font-semibold' : 'text-[#444748]/60'
                }`}
              >
                {STAGE_LABELS[stage]}
              </p>
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <div className="w-4 h-[1px] bg-[#c4c7c7] -mt-4" />
            )}
          </div>
        )
      })}
    </div>
  )
}
