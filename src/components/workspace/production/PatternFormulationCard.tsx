import type { PatternFormulation, StageRecord } from '@/lib/production/types'
import { PatternReferenceCard } from './PatternReferenceCard'

interface PatternFormulationCardProps {
  patternFormulation: PatternFormulation | null
  stageRecords: StageRecord[]
}

// Sprint 01 Task 4/4.5 — operator's Formulasi Pola reference for the stages
// that don't already surface it inline in their own working panel
// (Cutting/Sewing/QC keep their embedded PatternReferenceCard, right where
// those operators are working — this fills the gap for Material Prep/
// Finishing/Packing/Shipping instead of duplicating it). Just a titled
// wrapper — PatternReferenceCard itself owns the click-to-fullscreen
// behavior, so both this card and the inline usages share the exact same
// expand/viewer mechanism instead of each wiring their own.
export function PatternFormulationCard({ patternFormulation, stageRecords }: PatternFormulationCardProps) {
  return (
    <div className="bg-[#fbf9fc] rounded-2xl p-6 shadow-sm border border-[#c6c6cc]/30">
      <h3 className="font-caslon text-xl text-[#161b29] mb-4">📐 Formulasi Pola</h3>
      <PatternReferenceCard patternFormulation={patternFormulation} stageRecords={stageRecords} />
    </div>
  )
}
