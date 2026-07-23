import type { MeasurementFields, MeasurementKey } from '@/components/workspace/measurement/types'
import { SectionShell } from './SectionShell'
import { SectionEyebrow } from './SectionEyebrow'

interface MeasurementSummarySectionProps {
  measurement: MeasurementFields
}

const LABELS: Record<MeasurementKey, string> = {
  neck: 'Leher',
  shoulder: 'Bahu',
  chest: 'Dada',
  waist: 'Pinggang',
  hip: 'Pinggul',
  armhole: 'Lingkar Lengan',
  sleeve: 'Panjang Lengan',
  biceps: 'Bisep',
  elbow: 'Siku',
  wrist: 'Pergelangan Tangan',
  length: 'Panjang Thobe',
  hemWidth: 'Lebar Bawah',
}

// Simple label/value tiles, deliberately not a table — brief: "Jangan
// menyerupai spreadsheet". Fields the Fitter left blank are skipped rather
// than shown empty.
export function MeasurementSummarySection({ measurement }: MeasurementSummarySectionProps) {
  const rows = (Object.keys(LABELS) as MeasurementKey[])
    .map(key => ({ label: LABELS[key], value: measurement[key] }))
    .filter(row => row.value.trim().length > 0)

  if (rows.length === 0) return null

  return (
    <SectionShell>
      <SectionEyebrow>Ringkasan Ukuran</SectionEyebrow>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
        {rows.map(row => (
          <div key={row.label} className="text-center">
            <p className="font-sans text-[10px] uppercase tracking-widest text-secondary mb-1">
              {row.label}
            </p>
            <p className="font-fraunces text-lg text-on-surface">{row.value} cm</p>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
