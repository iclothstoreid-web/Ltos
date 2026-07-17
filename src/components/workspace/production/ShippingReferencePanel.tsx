'use client'

import type { StageRecord } from '@/lib/production/types'
import { DigitalHandoverCard } from './DigitalHandoverCard'

interface ShippingReferencePanelProps {
  stageRecords: StageRecord[]
}

// Pengiriman's "Data Acuan" — per the master prompt, read-only Ringkasan
// Packing + Evidence Packing + Catatan Packing. `DigitalHandoverCard`
// already renders exactly that shape (checklist, evidence photo, notes) for
// any completed stage record, so it's reused here against the latest
// completed Packing record instead of building a second read-only summary
// of the same data.
export function ShippingReferencePanel({ stageRecords }: ShippingReferencePanelProps) {
  const packingRecord = [...stageRecords]
    .filter(r => r.stage === 'packing' && r.status === 'completed')
    .sort((a, b) => b.attempt - a.attempt)[0]

  return (
    <div className="pb-6 border-b border-[#c6c6cc]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
          Data Acuan Packing
        </p>
        <span className="font-hanken text-[9px] uppercase tracking-widest text-[#76777d] bg-[#efedf0] px-2 py-0.5 rounded">
          Hanya Baca
        </span>
      </div>
      {packingRecord ? (
        <DigitalHandoverCard record={packingRecord} />
      ) : (
        <p className="font-hanken text-xs text-[#46464c]">Belum ada data packing.</p>
      )}
    </div>
  )
}
