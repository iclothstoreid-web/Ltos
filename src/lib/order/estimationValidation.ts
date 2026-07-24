import type { ServiceValidationResult } from './service'
import type { DeadlineFlexibility } from '@/components/workspace/consultation-review/eventInformationCodec'

// Consultation Decision Engine (Milestone 3): no new estimation logic here.
// This only compares the Estimated Finish already computed by
// preview_service_validation (Hari D + Capacity + KPI, see service.ts)
// against the Fitter-entered Target Usage Date, and factors in Deadline
// Flexibility. Pure client-side comparison -- LTOS gives a recommendation,
// the Owner/Fitter keeps the decision.
export type EstimationVerdict = 'SAFE' | 'RISK' | 'IMPOSSIBLE'

export interface EstimationValidationResult {
  verdict: EstimationVerdict
  bufferDays: number
  estimatedFinish: string
  targetUsageDate: string
}

export const IMPOSSIBLE_RECOMMENDATIONS = [
  'Negosiasi tanggal pemakaian dengan customer',
  'Tawarkan Express Production',
  'Ajukan Owner Override kapasitas',
  'Tolak order',
] as const

// Returns null when the inputs needed to judge aren't complete yet
// (Estimasi Pengerjaan not chosen, or Target Usage Date not filled) --
// there is nothing to validate, not a verdict of its own.
export function computeEstimationValidation(
  validation: ServiceValidationResult | null,
  targetUsageDate: string,
  deadlineFlexibility: DeadlineFlexibility
): EstimationValidationResult | null {
  if (!validation?.estimated_completion || !targetUsageDate) return null

  const estimatedFinishMs = Date.parse(validation.estimated_completion)
  const targetMs = Date.parse(targetUsageDate)
  if (Number.isNaN(estimatedFinishMs) || Number.isNaN(targetMs)) return null

  const bufferDays = Math.round((targetMs - estimatedFinishMs) / 86_400_000)

  let verdict: EstimationVerdict
  if (bufferDays < 0) {
    // Estimated finish lands after the customer needs it.
    verdict = deadlineFlexibility === 'flexible' ? 'RISK' : 'IMPOSSIBLE'
  } else if (bufferDays === 0 || validation.overall_status === 'yellow') {
    // On the day with zero margin, or the underlying Hari D/Capacity/KPI
    // signal is already amber -- safe on paper, but tight.
    verdict = 'RISK'
  } else if (validation.overall_status === 'red') {
    // Capacity engine itself is over capacity, even though the date works.
    verdict = 'RISK'
  } else {
    verdict = 'SAFE'
  }

  return {
    verdict,
    bufferDays,
    estimatedFinish: validation.estimated_completion,
    targetUsageDate,
  }
}
