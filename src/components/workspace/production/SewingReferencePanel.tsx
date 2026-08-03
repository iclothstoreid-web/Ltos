'use client'

import type { PatternFormulation, StageRecord } from '@/lib/production/types'
import { PatternReferenceCard } from './PatternReferenceCard'
import { DigitalHandoverCard } from './DigitalHandoverCard'

interface SewingReferencePanelProps {
  patternFormulation: PatternFormulation | null
  stageRecords: StageRecord[]
}

// Penjahitan's "Data Acuan" — the same read-only Formulasi Pola reference
// Pemotongan Kain uses, plus confirmation that all fabric panels have been
// cut. Reuses `DigitalHandoverCard` (already a read-only operator/jam
// mulai/selesai/durasi/checklist/evidence/notes summary of any completed
// stage record) against the latest completed cutting record instead of
// building a second display for the same shape of data.
export function SewingReferencePanel({ patternFormulation, stageRecords }: SewingReferencePanelProps) {
  const cuttingRecord = [...stageRecords]
    .filter(r => r.stage === 'cutting' && r.status === 'completed')
    .sort((a, b) => b.attempt - a.attempt)[0]

  return (
    <div className="space-y-6">
      <PatternReferenceCard patternFormulation={patternFormulation} stageRecords={stageRecords} />

      <div className="pb-6 border-b border-outline-variant">
        <div className="flex items-center justify-between mb-3">
          <p className="font-hanken text-[10px] uppercase tracking-widest text-secondary">
            Konfirmasi Pemotongan Kain
          </p>
          <span className="font-hanken text-[9px] uppercase tracking-widest text-secondary/80 bg-surface-container px-2 py-0.5 rounded">
            Hanya Baca
          </span>
        </div>
        {cuttingRecord ? (
          <DigitalHandoverCard record={cuttingRecord} />
        ) : (
          <p className="font-hanken text-xs text-secondary">Belum ada data pemotongan kain.</p>
        )}
      </div>
    </div>
  )
}
