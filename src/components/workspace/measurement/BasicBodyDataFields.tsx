'use client'

import { MeasurementInput } from './MeasurementInput'
import { BASIC_BODY_DATA_KEYS, BASIC_BODY_DATA_LABELS, BASIC_BODY_DATA_UNITS } from './types'
import type { BasicBodyDataKey, MeasurementFields } from './types'

interface BasicBodyDataFieldsProps {
  fields: MeasurementFields
  onChange: (key: BasicBodyDataKey, value: string) => void
}

// Snapshot of the customer's physical condition at measurement time — not an
// estimation input, not part of the 12 required measurement fields, and
// never fed into computePatternFormulation's sizing math (see types.ts).
// Rendered above the main measurement accordion, per the brief.
export function BasicBodyDataFields({ fields, onChange }: BasicBodyDataFieldsProps) {
  return (
    <div className="mb-6">
      <h2 className="font-sans text-xs uppercase tracking-widest text-[#444748] mb-3">
        Data Dasar Tubuh
      </h2>
      <div className="space-y-3 border-[0.5px] border-[#c4c7c7] bg-white/50 p-4">
        {BASIC_BODY_DATA_KEYS.map(key => (
          <MeasurementInput
            key={key}
            label={BASIC_BODY_DATA_LABELS[key]}
            value={fields[key] ?? ''}
            onChange={v => onChange(key, v)}
            unit={BASIC_BODY_DATA_UNITS[key]}
            step={1}
          />
        ))}
      </div>
    </div>
  )
}
