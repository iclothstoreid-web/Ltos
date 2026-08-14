import type { SupabaseClient } from '@supabase/supabase-js'
import { getCommercialSummary } from '@/lib/commercial/summary'

// Sprint W9-1 §12 — KPI Dashboard data layer.
//
// Honesty boundary, stated once here rather than re-litigated per metric:
// this sprint builds the *tracking* pipeline (GA4 events) — it does not
// stand up the GA4 Data API (which needs a real GA4 property + a Google
// Cloud service account, neither of which exist in this project's env).
// So every metric that can only come from analytics event data (visitors,
// consultation/measurement counts derived from funnel events, conversion
// rate, funnel drop-off, CTA leaderboard, fabric ranking, experiment
// results) is honestly returned as `available: false` — never a fabricated
// number — until that connection exists. Metrics that already live in
// Supabase (orders, revenue, AOV, commercial breakdown) reuse the real,
// existing getCommercialSummary()/getCommercialTypeSummary() queries
// rather than a second, drifting copy of that logic.

export interface DashboardMetric<T> {
  value: T | null
  available: boolean
  /** Only set when available is false — tells the dashboard UI what to render instead of a number. */
  unavailableReason?: string
}

const GA4_NOT_CONNECTED = 'GA4 Data API belum terhubung — memerlukan GA4 property + Google Cloud service account.'

export interface ExecutiveKpis {
  visitors: DashboardMetric<number>
  consultations: DashboardMetric<number>
  measurements: DashboardMetric<number>
  orders: DashboardMetric<number>
  revenue: DashboardMetric<number>
  aov: DashboardMetric<number>
  conversionRate: DashboardMetric<number>
}

export async function getExecutiveKpis(supabase: SupabaseClient): Promise<ExecutiveKpis> {
  const [commercial, consultationsCount] = await Promise.all([
    getCommercialSummary(supabase),
    supabase.from('consultations').select('id', { count: 'exact', head: true }),
  ])

  const orders = commercial.approvedQuotationRows.length
  const revenue = commercial.sales
  const aov = orders > 0 ? revenue / orders : 0

  return {
    visitors: { value: null, available: false, unavailableReason: GA4_NOT_CONNECTED },
    consultations: {
      value: consultationsCount.count ?? null,
      available: consultationsCount.error == null,
      unavailableReason: consultationsCount.error ? consultationsCount.error.message : undefined,
    },
    measurements: { value: null, available: false, unavailableReason: GA4_NOT_CONNECTED },
    orders: { value: orders, available: true },
    revenue: { value: revenue, available: true },
    aov: { value: aov, available: true },
    conversionRate: { value: null, available: false, unavailableReason: GA4_NOT_CONNECTED },
  }
}

export interface CroDashboardData {
  funnel: DashboardMetric<{ step: string; count: number }[]>
  dropOff: DashboardMetric<{ fromStep: string; toStep: string; dropOffRate: number }[]>
  ctaLeaderboard: DashboardMetric<{ ctaId: string; clicks: number }[]>
  fabricRanking: DashboardMetric<{ materialId: string; engagementScore: number }[]>
  experimentStatus: { experimentId: string; name: string; status: string; variantCount: number }[]
}

export async function getCroDashboardData(): Promise<CroDashboardData> {
  // Experiment status is the one CRO section backed by real, local data —
  // the registry itself (src/lib/experiments/registry.ts) — not GA4, so it
  // needs no availability gate.
  const { EXPERIMENTS } = await import('@/lib/experiments/registry')

  return {
    funnel: { value: null, available: false, unavailableReason: GA4_NOT_CONNECTED },
    dropOff: { value: null, available: false, unavailableReason: GA4_NOT_CONNECTED },
    ctaLeaderboard: { value: null, available: false, unavailableReason: GA4_NOT_CONNECTED },
    fabricRanking: { value: null, available: false, unavailableReason: GA4_NOT_CONNECTED },
    experimentStatus: EXPERIMENTS.map((experiment) => ({
      experimentId: experiment.id,
      name: experiment.name,
      status: experiment.status,
      variantCount: experiment.variants.length,
    })),
  }
}
