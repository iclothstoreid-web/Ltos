import type { ConfidenceInput } from './types'

// Confidence Engine — scores how much to trust one Decision based on the
// completeness of the data it was derived from and how many records back
// it. Deliberately independent of Priority Engine: how urgent a situation
// looks and how sure we are about it are two different questions.
//
// `sampleSize` never crushes confidence to near-zero for a single
// deterministic fact (e.g. one order's own SLA state, read straight from
// get_sla_risk_orders) — that fact is not statistically "thin", it is
// simply about one row. SAMPLE_FLOOR is the confidence a single
// well-formed record still carries; only fully-missing data (sampleSize
// <= 0) drops below it, and confidence only reaches 100 once completeness
// is full AND the sample reaches MIN_SAMPLE_SIZE_FOR_FULL_CONFIDENCE.
const SAMPLE_FLOOR = 0.7
const MIN_SAMPLE_SIZE_FOR_FULL_CONFIDENCE = 3

export function computeConfidence(input: ConfidenceInput): number {
  const completeness = Math.max(0, Math.min(1, input.completeness))
  const sampleFactor =
    input.sampleSize <= 0
      ? SAMPLE_FLOOR
      : SAMPLE_FLOOR +
        (1 - SAMPLE_FLOOR) * Math.min(1, input.sampleSize / MIN_SAMPLE_SIZE_FOR_FULL_CONFIDENCE)
  return Math.round(completeness * sampleFactor * 100)
}
