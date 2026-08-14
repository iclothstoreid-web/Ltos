import type { SupabaseClient } from '@supabase/supabase-js'
import { getCommercialSummary } from '@/lib/commercial/summary'
import { getCroDashboardData, type CroDashboardData } from './dashboardData'

// Sprint W9-1 §13 — Reporting Structure.

export type ReportPeriod = 'daily' | 'weekly' | 'monthly'

export interface ReportRange {
  start: Date
  end: Date
}

export function getReportRange(period: ReportPeriod, referenceDate: Date = new Date()): ReportRange {
  const end = new Date(referenceDate)
  const start = new Date(referenceDate)
  if (period === 'daily') start.setDate(start.getDate() - 1)
  if (period === 'weekly') start.setDate(start.getDate() - 7)
  if (period === 'monthly') start.setMonth(start.getMonth() - 1)
  return { start, end }
}

export interface AnalyticsReport {
  period: ReportPeriod
  generatedAt: string
  rangeStart: string
  rangeEnd: string
  /** Real, date-bounded — filtered from getCommercialSummary()'s approvedQuotationRows (which carries a real approvedAt timestamp) rather than a new/duplicate query. */
  revenue: number
  ordersApproved: number
  aov: number
  cro: CroDashboardData
  notes: string[]
}

/**
 * Generates a report for the given period. Revenue/orders are real,
 * date-bounded numbers derived from the existing commercial summary — no
 * new Supabase query, no change to getCommercialSummary()'s own contract
 * (other callers, e.g. the Owner Dashboard, are unaffected). CRO section
 * mirrors the dashboard's own honest availability gates — see
 * dashboardData.ts.
 */
export async function generateAnalyticsReport(supabase: SupabaseClient, period: ReportPeriod, referenceDate: Date = new Date()): Promise<AnalyticsReport> {
  const range = getReportRange(period, referenceDate)
  const [commercial, cro] = await Promise.all([getCommercialSummary(supabase), getCroDashboardData()])

  const rowsInRange = commercial.approvedQuotationRows.filter((row) => {
    const approvedAt = new Date(row.approvedAt).getTime()
    return approvedAt >= range.start.getTime() && approvedAt <= range.end.getTime()
  })

  const revenue = rowsInRange.reduce((sum, row) => sum + row.amount, 0)
  const ordersApproved = rowsInRange.length
  const aov = ordersApproved > 0 ? revenue / ordersApproved : 0

  const notes = [
    'Visitor, funnel, dan CTA-level metrics belum tersedia di laporan ini — memerlukan koneksi GA4 Data API (lihat docs/analytics/KPI_DEFINITIONS.md).',
    'Revenue dan Orders Approved dihitung dari quotations.approved_at yang benar-benar jatuh dalam rentang periode ini — bukan angka all-time.',
  ]

  return {
    period,
    generatedAt: new Date().toISOString(),
    rangeStart: range.start.toISOString(),
    rangeEnd: range.end.toISOString(),
    revenue,
    ordersApproved,
    aov,
    cro,
    notes,
  }
}

export function formatReportAsMarkdown(report: AnalyticsReport): string {
  const currency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

  const lines = [
    `# Analytics Report — ${report.period}`,
    '',
    `Generated: ${report.generatedAt}`,
    `Range: ${report.rangeStart} — ${report.rangeEnd}`,
    '',
    '## Commercial',
    `- Revenue (approved): ${currency(report.revenue)}`,
    `- Orders Approved: ${report.ordersApproved}`,
    `- AOV: ${currency(report.aov)}`,
    '',
    '## Experiments',
    ...report.cro.experimentStatus.map((experiment) => `- ${experiment.name}: ${experiment.status} (${experiment.variantCount} variants)`),
    '',
    '## Notes',
    ...report.notes.map((note) => `- ${note}`),
  ]

  return lines.join('\n')
}
