// Owner Intelligence Engine (Sprint D.2) — a read-only derivation layer over
// signals that already exist (get_owner_summary / get_sla_risk_orders via
// src/lib/decision, getCommercialSummary, getMaterialAttentionList). It never
// re-derives a number an existing engine/RPC already computed; it only
// classifies, prioritizes, and scores what's already there into one
// consistent `Decision` shape a future UI can render without further logic.
// No new UI, no new page, no new business rule this sprint — see
// decisionEngine.ts/insightGenerator.ts for the composition entry points.

export type IntelligenceDomain = 'production' | 'inventory' | 'capacity' | 'sla' | 'commercial'

export type Priority = 'critical' | 'high' | 'medium' | 'low'

// Consistent ascending rank (0 = most urgent) so any domain's Decisions sort
// the same way — see decisionEngine.ts/insightGenerator.ts.
export const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

// One normalized decision. Every field named in the Sprint D.2 brief is
// present; `priority`/`confidence` are always produced via Priority
// Engine/Confidence Engine (priorityEngine.ts/confidenceEngine.ts) rather
// than set ad hoc per domain, so they stay comparable across domains.
export interface Decision {
  id: string
  domain: IntelligenceDomain
  title: string
  description: string
  reason: string
  impact: string
  recommendation: string
  priority: Priority
  /** 0-100, see confidenceEngine.ts. */
  confidence: number
  /** Which existing RPC/engine this Decision's data came from — e.g.
   *  'get_sla_risk_orders', 'getCommercialSummary'. Traceability only, never
   *  parsed/branched on. */
  source: string
  /** Present only when this Decision traces back to one order/material row —
   *  lets a future UI deep-link the same way existing Decision Cards do. */
  refId?: string
}

// Confidence Engine input — how complete/trustworthy the data behind one
// Decision is, never a judgment on the business situation itself (that is
// `priority`'s job — the two are scored independently on purpose, so a
// high-priority Decision built from thin data still surfaces as
// low-confidence rather than silently looking as certain as a
// well-supported one).
export interface ConfidenceInput {
  /** 0-1: fraction of the fields this Decision depends on that were actually
   *  present (not null/undefined/empty) in the source data. */
  completeness: number
  /** How many underlying records this Decision was derived from (e.g. 1 for
   *  a single at-risk order, N for an aggregate over N materials). */
  sampleSize: number
}
