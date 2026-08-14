// Sprint W9-1 §10 — Experiment Framework types.

export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed'

export interface ExperimentVariant {
  id: string
  /** Relative weight — need not sum to 100; assignment.ts normalizes against the total. */
  weight: number
  description?: string
}

export interface ExperimentDefinition {
  id: string
  name: string
  hypothesis: string
  status: ExperimentStatus
  variants: ExperimentVariant[]
  /** The GA4 event (see events.ts) whose rate this experiment is trying to move — kept as a plain string, not a Ga4EventName import, so registry.ts doesn't need to import the full taxonomy just to reference one name. */
  primaryMetric: string
  startedAt?: string
  endedAt?: string
}

export interface ExperimentResult {
  experimentId: string
  variantId: string
  metric: string
  sampleSize: number
  conversions: number
  conversionRate: number
  /** Populated once a real statistical test is run against real data — this framework doesn't compute significance itself (see docs/analytics/EXPERIMENT_BACKLOG.md), only records the shape a result should have. */
  confidenceLevel?: number
  isWinner?: boolean
}
