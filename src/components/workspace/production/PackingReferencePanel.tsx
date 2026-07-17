'use client'

import type { StageRecord } from '@/lib/production/types'
import { DigitalHandoverCard } from './DigitalHandoverCard'

interface PackingReferencePanelProps {
  stageRecords: StageRecord[]
}

// Packing's "Data Acuan" — per the master prompt, read-only Ringkasan
// Finishing + Evidence Finishing + Catatan Finishing. `DigitalHandoverCard`
// already renders exactly that shape (checklist, evidence photo, notes) for
// any completed stage record, so it's reused here against the latest
// completed Finishing record instead of building a second read-only summary
// of the same data.
export function PackingReferencePanel({ stageRecords }: PackingReferencePanelProps) {
  const finishingRecord = [...stageRecords]
    .filter(r => r.stage === 'finishing' && r.status === 'completed')
    .sort((a, b) => b.attempt - a.attempt)[0]

  return (
    <div className="pb-6 border-b border-[#c6c6cc]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
          Data Acuan Finishing
        </p>
        <span className="font-hanken text-[9px] uppercase tracking-widest text-[#76777d] bg-[#efedf0] px-2 py-0.5 rounded">
          Hanya Baca
        </span>
      </div>
      {finishingRecord ? (
        <DigitalHandoverCard record={finishingRecord} />
      ) : (
        <p className="font-hanken text-xs text-[#46464c]">Belum ada data finishing.</p>
      )}
    </div>
  )
}
