'use client'

import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { MeasurementFields, MeasurementKey } from '@/components/workspace/measurement/types'
import { CUTTING_MODEL_LABELS, WRIST_FINISHING_LABELS } from '@/components/workspace/measurement/types'
import { MeasurementInput } from '@/components/workspace/measurement/MeasurementInput'
import type { Operator, PatternFormulation, PatternTemplate } from '@/lib/production/types'
import { PATTERN_TEMPLATE_LABELS } from '@/lib/production/stageConfig'
import { savePatternFormulation } from '@/lib/production/client'
import { computePatternFormulation } from '@/lib/production/patternFormulas'

interface PatternFormulationPanelProps {
  supabase: SupabaseClient
  orderId: string
  lockedMeasurements: MeasurementFields | null
  existing: PatternFormulation | null
  operator: Operator
  onSaved: () => void
}

const TEMPLATES: PatternTemplate[] = ['slim_fit', 'standar', 'regular', 'custom']

export const FIELD_LABELS: Record<MeasurementKey, string> = {
  neck: 'Leher',
  shoulder: 'Bahu',
  chest: 'Dada',
  waist: 'Pinggang',
  hip: 'Pinggul',
  armhole: 'Lubang Lengan',
  sleeve: 'Lengan',
  biceps: 'Bisep',
  elbow: 'Siku',
  wrist: 'Pergelangan',
  length: 'Panjang',
  hemWidth: 'Lebar Bawah',
}

// The work-content step of Formulasi Pola, shown before the completion scan:
// pick a template, get the locked body measurements copied through as the
// pattern's starting point (placeholder pending real per-template offsets,
// confirmed with the user), then edit directly. Saving here only persists
// the formulation — completing the stage still goes through the shared
// evidence/checklist/Setujui-Kembalikan shell like every other stage.
export function PatternFormulationPanel({
  supabase,
  orderId,
  lockedMeasurements,
  existing,
  operator,
  onSaved,
}: PatternFormulationPanelProps) {
  const [template, setTemplate] = useState<PatternTemplate>(existing?.template ?? 'standar')
  const [fields, setFields] = useState<MeasurementFields>(
    existing?.pattern_measurements ??
      (lockedMeasurements ? computePatternFormulation(lockedMeasurements) : ({} as MeasurementFields))
  )
  const [saving, setSaving] = useState(false)

  function handleTemplateChange(next: PatternTemplate) {
    setTemplate(next)
    if (!existing) {
      // Re-copy the computed starting point (locked measurement + Cutting
      // Model + Finishing Pergelangan rules) for the newly chosen template —
      // still directly editable afterwards.
      setFields(lockedMeasurements ? computePatternFormulation(lockedMeasurements) : ({} as MeasurementFields))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await savePatternFormulation(supabase, {
        orderId,
        template,
        patternMeasurements: fields,
        operatorId: operator.id,
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {lockedMeasurements && (
        <div className="mb-6 pb-6 border-b border-[#c6c6cc]">
          <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">
            Ukuran Tubuh (Terkunci)
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-hanken text-xs text-[#46464c]">
            {(Object.keys(FIELD_LABELS) as Array<MeasurementKey>).map(key => (
              <span key={key}>
                {FIELD_LABELS[key]}: {lockedMeasurements[key] || '—'} cm
              </span>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#c6c6cc]/60 flex gap-6 font-hanken text-xs text-[#46464c]">
            <span>
              Model Potongan:{' '}
              {lockedMeasurements.cuttingModel ? CUTTING_MODEL_LABELS[lockedMeasurements.cuttingModel] : '—'}
            </span>
            <span>
              Finishing Pergelangan:{' '}
              {lockedMeasurements.wristFinishing
                ? WRIST_FINISHING_LABELS[lockedMeasurements.wristFinishing]
                : '—'}
            </span>
          </div>
        </div>
      )}

      <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-1">
        Template
      </label>
      <select
        value={template}
        onChange={e => handleTemplateChange(e.target.value as PatternTemplate)}
        className="w-full py-2 mb-6 bg-transparent border-b border-[#c6c6cc] focus:border-[#755b00]
                   outline-none font-hanken text-sm text-[#161b29] transition-colors"
      >
        {TEMPLATES.map(t => (
          <option key={t} value={t}>
            {PATTERN_TEMPLATE_LABELS[t]}
          </option>
        ))}
      </select>

      <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-3">
        Ukuran Pola
      </p>
      <div className="space-y-2 mb-6">
        {(Object.keys(FIELD_LABELS) as Array<MeasurementKey>).map(key => (
          <MeasurementInput
            key={key}
            label={FIELD_LABELS[key]}
            value={fields[key] || ''}
            onChange={v => setFields(prev => ({ ...prev, [key]: v }))}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#161b29] text-white py-3 font-hanken text-sm font-semibold
                   uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-50"
      >
        {saving ? 'Menyimpan...' : 'Simpan Formulasi Pola'}
      </button>
    </div>
  )
}
