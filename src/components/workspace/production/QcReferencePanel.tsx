'use client'

import type { PatternFormulation, StageRecord } from '@/lib/production/types'
import { PatternReferenceCard } from './PatternReferenceCard'
import { DigitalHandoverCard } from './DigitalHandoverCard'

interface QcReferencePanelProps {
  patternFormulation: PatternFormulation | null
  stageRecords: StageRecord[]
}

// Pemeriksaan Kualitas' "Data Acuan" — the same read-only Formulasi Pola
// reference Pemotongan Kain and Penjahitan use, plus Penjahitan's own
// completed record (Ringkasan, Evidence, Catatan) via `DigitalHandoverCard`,
// reused rather than building a second read-only summary of the same shape.
export function QcReferencePanel({ patternFormulation, stageRecords }: QcReferencePanelProps) {
  const sewingRecord = [...stageRecords]
    .filter(r => r.stage === 'sewing' && r.status === 'completed')
    .sort((a, b) => b.attempt - a.attempt)[0]

  return (
    <div className="space-y-6">
      <PatternReferenceCard patternFormulation={patternFormulation} stageRecords={stageRecords} />

      <div className="pb-6 border-b border-[#c6c6cc]">
        <div className="flex items-center justify-between mb-3">
          <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
            Ringkasan Penjahitan
          </p>
          <span className="font-hanken text-[9px] uppercase tracking-widest text-[#76777d] bg-[#efedf0] px-2 py-0.5 rounded">
            Hanya Baca
          </span>
        </div>
        {sewingRecord ? (
          <DigitalHandoverCard record={sewingRecord} />
        ) : (
          <p className="font-hanken text-xs text-[#46464c]">Belum ada data penjahitan.</p>
        )}
      </div>
    </div>
  )
}
