'use client'

import { useState } from 'react'
import type { PatternFormulation, StageRecord } from '@/lib/production/types'
import { PATTERN_TEMPLATE_LABELS } from '@/lib/production/stageConfig'
import { FIELD_LABELS } from './PatternFormulationPanel'
import { FullscreenMediaModal } from './FullscreenMediaModal'

interface PatternReferenceCardProps {
  patternFormulation: PatternFormulation | null
  stageRecords: StageRecord[]
}

// Pemotongan Kain's "Data Acuan Formulator" — read-only view of the
// Formulasi Pola stage's saved output (template + 12 pattern measurements +
// the formulator's own completion notes). Per the master prompt, cutting
// operators may only reference this data; editing it stays Formulasi Pola's
// job, so this renders text only, never inputs.
//
// Sprint 01 Task 4.5 — click-to-fullscreen lives here (not in each caller)
// so every place this card is used — inline in Cutting/Sewing/QC's own
// panel, and wrapped by PatternFormulationCard for the other stages — gets
// the same expand behavior for free via the same FullscreenMediaModal
// instance, instead of each call site wiring its own modal.
export function PatternReferenceCard({ patternFormulation, stageRecords }: PatternReferenceCardProps) {
  const [expanded, setExpanded] = useState(false)

  const formulationRecord = [...stageRecords]
    .filter(r => r.stage === 'pattern_formulation' && r.status === 'completed')
    .sort((a, b) => b.attempt - a.attempt)[0]

  const body = (
    <div className="mb-6 pb-6 border-b border-[#c6c6cc]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
          Data Acuan Formulasi Pola
        </p>
        <div className="flex items-center gap-2">
          {patternFormulation && (
            <span className="material-symbols-outlined text-[16px] text-[#76777d]">open_in_full</span>
          )}
          <span className="font-hanken text-[9px] uppercase tracking-widest text-[#76777d] bg-[#efedf0] px-2 py-0.5 rounded">
            Hanya Baca
          </span>
        </div>
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

  return (
    <>
      <button
        type="button"
        onClick={() => patternFormulation && setExpanded(true)}
        disabled={!patternFormulation}
        className="w-full text-left disabled:cursor-default"
      >
        {body}
      </button>

      {expanded && patternFormulation && (
        <FullscreenMediaModal kind="detail" alt="Formulasi Pola" onClose={() => setExpanded(false)}>
          <div className="p-6">{body}</div>
        </FullscreenMediaModal>
      )}
    </>
  )
}
