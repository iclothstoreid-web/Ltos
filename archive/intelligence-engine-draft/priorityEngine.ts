import type { SlaRiskLevel } from '@/lib/decision/types'
import type { StockStatus } from '@/lib/inventory/types'
import type { PaymentStatus } from '@/lib/commercial/types'
import type { Priority } from './types'

// Priority Engine — the ONE place that normalizes every domain's own
// existing vocabulary into one consistent 4-level scale. LTOS already has
// three different priority-shaped vocabularies scattered across sprints
// (Decision Center's 'critical'|'warning'|'info' severity in
// src/lib/decision/actions.ts, the Priority & Capacity Engine's
// BusinessPriority 'critical'|'high'|'normal' in src/lib/decision/types.ts,
// Estimation Validation's SAFE/RISK/IMPOSSIBLE verdict) — none of them agree
// on how many levels exist or what "critical" means relative to the others.
// Recommendation Engine calls these adapters instead of inventing a new
// mapping per domain, so a "critical" Decision means the same thing whether
// it came from SLA, Capacity, Inventory, or Commercial.

const SCORE_THRESHOLDS: ReadonlyArray<{ min: number; priority: Priority }> = [
  { min: 80, priority: 'critical' },
  { min: 55, priority: 'high' },
  { min: 30, priority: 'medium' },
  { min: 0, priority: 'low' },
]

/** Normalizes a 0-100 urgency score into the canonical 4-level Priority. */
export function priorityFromScore(score: number): Priority {
  const clamped = Math.max(0, Math.min(100, score))
  return SCORE_THRESHOLDS.find(t => clamped >= t.min)!.priority
}

/** Adapter for Decision Center's existing 'critical'|'warning'|'info' severity. */
export function priorityFromSeverity(severity: 'critical' | 'warning' | 'info'): Priority {
  if (severity === 'critical') return 'critical'
  if (severity === 'warning') return 'high'
  return 'medium'
}

/** Adapter for the Priority & Capacity Engine's BusinessPriority — null means
 *  the order is on Hold (Owner Override), which is deliberately never
 *  auto-escalated (see src/lib/decision/types.ts), so it normalizes to
 *  'medium' rather than being inferred as urgent. */
export function priorityFromBusinessPriority(
  businessPriority: 'critical' | 'high' | 'normal' | null
): Priority {
  if (businessPriority === 'critical') return 'critical'
  if (businessPriority === 'high') return 'high'
  return 'medium'
}

/** Adapter for Estimation Validation's SAFE/RISK/IMPOSSIBLE verdict. */
export function priorityFromEstimationVerdict(verdict: 'SAFE' | 'RISK' | 'IMPOSSIBLE'): Priority {
  if (verdict === 'IMPOSSIBLE') return 'critical'
  if (verdict === 'RISK') return 'high'
  return 'low'
}

/** Adapter for get_sla_risk_orders()' risk_level ('on_track' never reaches
 *  here in practice — Recommendation Engine only surfaces at-risk orders —
 *  but is mapped for completeness/type-safety). */
export function priorityFromSlaRiskLevel(level: SlaRiskLevel): Priority {
  if (level === 'over_sla') return 'critical'
  if (level === 'risk') return 'high'
  return 'low'
}

/** Adapter for materialStockStatus()/getMaterialAttentionList()'s StockStatus. */
export function priorityFromStockStatus(status: StockStatus): Priority {
  if (status === 'habis') return 'critical'
  if (status === 'menipis') return 'high'
  return 'low'
}

/** Adapter for getCommercialSummary()'s PaymentStatus, applied only to
 *  outstanding rows (getCommercialSummary already excludes 'lunas'/
 *  not-billable rows from `outstandingRows`, so those branches are here for
 *  type-safety, not because they are expected to occur). */
export function priorityFromPaymentStatus(status: PaymentStatus): Priority {
  if (status === 'belum_dibayar') return 'high'
  if (status === 'dp_diterima') return 'medium'
  return 'low'
}
