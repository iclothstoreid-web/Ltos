'use client'

import type { MeasurementFields, MeasurementKey } from '@/components/workspace/measurement/types'
import { FIELD_LABELS } from '@/components/workspace/production/PatternFormulationPanel'

interface OrderSummaryMeasurementCardProps {
  measurement: MeasurementFields | null
  bodyTags: string[]
}

// Order Summary's read-only "Measurement" section (Task 2 — no edit action,
// unlike consultation-review/MeasurementSummaryCard which links back into
// the live Measurement workspace). Reuses the same FIELD_LABELS dictionary
// PatternReferenceCard already reads off PatternFormulationPanel, instead of
// inventing a second copy of the 12 field labels.
export function OrderSummaryMeasurementCard({ measurement, bodyTags }: OrderSummaryMeasurementCardProps) {
  return (
    <div className="bg-[#fbf9fc] rounded-2xl p-6 shadow-sm border border-[#c6c6cc]/30 space-y-4">
      <h3 className="font-caslon text-xl text-[#161b29]">Measurement</h3>

      {bodyTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {bodyTags.map(tag => (
            <span
              key={tag}
              className="font-jetbrains text-[10px] tracking-widest uppercase text-[#755b00] bg-[#755b00]/10 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {measurement ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 font-hanken text-xs text-[#46464c]">
          {(Object.keys(FIELD_LABELS) as Array<MeasurementKey>).map(key => (
            <span key={key}>
              {FIELD_LABELS[key]}: {measurement[key] || '—'} cm
            </span>
          ))}
        </div>
      ) : (
        <p className="font-hanken text-xs text-[#46464c]">Belum ada data pengukuran.</p>
      )}
    </div>
  )
}
