'use client'

import type { StageRecord } from '@/lib/production/types'
import { DigitalHandoverCard } from './DigitalHandoverCard'

interface FinishingReferencePanelProps {
  stageRecords: StageRecord[]
}

// Finishing's "Data Acuan" — per the master prompt, read-only Ringkasan
// hasil QC + Evidence QC + Catatan QC. `DigitalHandoverCard` already
// renders exactly that shape (checklist, evidence photo, notes) for any
// completed stage record, so it's reused here against the latest completed
// QC record instead of building a second read-only summary of the same data.
export function FinishingReferencePanel({ stageRecords }: FinishingReferencePanelProps) {
  const qcRecord = [...stageRecords]
    .filter(r => r.stage === 'qc' && r.status === 'completed')
    .sort((a, b) => b.attempt - a.attempt)[0]

  return (
    <div className="pb-6 border-b border-[#c6c6cc]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
          Data Acuan QC
        </p>
        <span className="font-hanken text-[9px] uppercase tracking-widest text-[#76777d] bg-[#efedf0] px-2 py-0.5 rounded">
          Hanya Baca
        </span>
      </div>
      {qcRecord ? (
        <DigitalHandoverCard record={qcRecord} />
      ) : (
        <p className="font-hanken text-xs text-[#46464c]">Belum ada data pemeriksaan kualitas.</p>
      )}
    </div>
  )
}
