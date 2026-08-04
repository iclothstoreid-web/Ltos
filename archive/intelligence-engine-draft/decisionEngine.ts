import { computeTodaysActions } from '@/lib/decision/actions'
import type { OwnerSummary, SlaRiskOrder } from '@/lib/decision/types'
import type { CommercialSummary } from '@/lib/commercial/summary'
import type { MaterialAttentionItem } from '@/lib/inventory/types'
import type { Decision } from './types'
import {
  generateProductionRecommendations,
  generateCapacityRecommendations,
  generateSlaRecommendations,
  generateInventoryRecommendations,
  generateCommercialRecommendations,
} from './recommendationEngine'

// Decision Engine — the ONE place that composes every domain's
// Recommendation Engine output into the full `Decision[]` for this owner
// intelligence pass. Every input is data an existing engine already
// computed (Sprint H's get_owner_summary/get_sla_risk_orders, Sprint K's
// getCommercialSummary, Sprint I.1's getMaterialAttentionList) — this file
// fetches nothing itself and invents no business rule; it only calls
// computeTodaysActions() once (it needs OwnerSummary + the commercial
// DP-outstanding count together) and hands that + the other signals to
// each domain function. Ordering/grouping for display is Insight
// Generator's job (insightGenerator.ts), not this file's.
export interface OwnerIntelligenceInput {
  ownerSummary: OwnerSummary
  slaRiskOrders: SlaRiskOrder[]
  commercialSummary: CommercialSummary
  materialAttention: MaterialAttentionItem[]
}

export function generateDecisions(input: OwnerIntelligenceInput): Decision[] {
  const actions = computeTodaysActions(input.ownerSummary, {
    dpOutstandingCount: input.commercialSummary.dpOutstandingCount,
  })

  return [
    ...generateProductionRecommendations(actions),
    ...generateCapacityRecommendations(actions),
    ...generateSlaRecommendations(input.slaRiskOrders),
    ...generateInventoryRecommendations(input.materialAttention),
    ...generateCommercialRecommendations(input.commercialSummary, actions),
  ]
}
