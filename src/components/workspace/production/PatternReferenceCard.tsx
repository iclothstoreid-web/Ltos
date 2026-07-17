'use client'

import type { PatternFormulation, StageRecord } from '@/lib/production/types'
import { PATTERN_TEMPLATE_LABELS } from '@/lib/production/stageConfig'
import { FIELD_LABELS } from './PatternFormulationPanel'

interface PatternReferenceCardProps {
  patternFormulation: PatternFormulation | null
  stageRecords: StageRecord[]
}

// Pemotongan Kain's "Data Acuan Formulator" — read-only view of the
// Formulasi Pola stage's saved output (template + 12 pattern measurements +
// the formulator's own completion notes). Per the master prompt, cutting
// operators may only reference this data; editing it stays Formulasi Pola's
// job, so this renders text only, never inputs.
export function PatternReferenceCard({ patternFormulation, stageRecords }: PatternReferenceCardProps) {
  const formulationRecord = [...stageRecords]
    .filter(r => r.stage === 'pattern_formulation' && r.status === 'completed')
    .sort((a, b) => b.attempt - a.attempt)[0]

  return (
    <div className="mb-6 pb-6 border-b border-[#c6c6cc]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
          Data Acuan Formulasi Pola
        </p>
        <span className="font-hanken text-[9px] uppercase tracking-widest text-[#76777d] bg-[#efedf0] px-2 py-0.5 rounded">
          Hanya Baca
        </span>
      </div>

      {!patternFormulation ? (
        <p className="font-hanken text-xs text-[#46464c]">Belum ada data formulasi pola.</p>
      ) : (
        <div className="space-y-4">
          <p className="font-hanken text-sm text-[#161b29]">
            Template:{' '}
            <strong>{PATTERN_TEMPLATE_LABELS[patternFormulation.template]}</strong>
          </p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-hanken text-xs text-[#46464c]">
            {Object.entries(patternFormulation.pattern_measurements).map(([key, value]) => (
              <span key={key}>
                {FIELD_LABELS[key as keyof typeof FIELD_LABELS]}: {value || '—'} cm
              </span>
            ))}
          </div>

          {formulationRecord?.notes && (
            <div className="p-3 border-l-4 border-[#755b00] bg-[#755b00]/5 rounded-r-xl">
              <p className="font-hanken text-[9px] uppercase tracking-widest text-[#755b00] mb-1">
                Catatan Formulator
              </p>
              <p className="font-hanken text-xs text-[#1b1b1e]">{formulationRecord.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
