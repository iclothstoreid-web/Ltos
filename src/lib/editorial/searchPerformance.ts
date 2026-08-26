import type { QueryIntent } from './queryIntent'
import type { KeywordCluster } from './keywordMap'

// Sprint W6R.3 — Search Console Readiness (§11). This project has no
// Search Console API connection ("Tidak perlu Search Console API jika
// tidak tersedia" — the brief's own words), so this is deliberately NOT a
// live integration and does not fabricate any query/impression/click/CTR/
// position numbers. What it provides is the data model + merge function so
// that, whenever real Search Console data becomes available (a manual CSV
// export, a future API key), it can be dropped into
// SEARCH_PERFORMANCE_RECORDS below and immediately joined against every
// query this site already tracks in KEYWORD_REPOSITORY — without inventing
// placeholder numbers in the meantime. An empty array here is the honest
// state today, not a bug.

export interface QueryPerformanceRecord {
  /** Must match a KeywordEntry.primaryKeyword or secondaryKeyword exactly (case-insensitive) to join. */
  query: string
  impressions: number
  clicks: number
  ctr: number
  averagePosition: number
  /** ISO date (YYYY-MM-DD) the row's date range ends, so records can be superseded rather than silently overwritten. */
  asOf: string
}

// Real data lands here later (e.g. parsed from a Search Console CSV
// export). Empty today — no fabricated impressions/clicks/CTR/position.
export const SEARCH_PERFORMANCE_RECORDS: QueryPerformanceRecord[] = []

export interface KeywordWithPerformance {
  primaryKeyword: string
  targetPage: string
  cluster: KeywordCluster
  intent: QueryIntent
  performance: QueryPerformanceRecord | null
}

// Joins the editorial keyword map against whatever real performance data
// exists (possibly none). `keywords` is passed in by the caller (rather
// than imported directly) to avoid a circular import between this file and
// keywordMap.ts.
export function joinKeywordPerformance(
  keywords: { primaryKeyword: string; targetPage: string; cluster: KeywordCluster; intent: QueryIntent }[]
): KeywordWithPerformance[] {
  const byQuery = new Map<string, QueryPerformanceRecord>()
  for (const record of SEARCH_PERFORMANCE_RECORDS) {
    byQuery.set(record.query.toLowerCase().trim(), record)
  }
  return keywords.map((entry) => ({
    primaryKeyword: entry.primaryKeyword,
    targetPage: entry.targetPage,
    cluster: entry.cluster,
    intent: entry.intent,
    performance: byQuery.get(entry.primaryKeyword.toLowerCase().trim()) ?? null,
  }))
}

// Coverage check — what fraction of the editorial keyword map has real
// performance data attached yet. Returns 0 today (SEARCH_PERFORMANCE_RECORDS
// is empty); becomes meaningful once real exports are added.
export function getPerformanceCoverage(totalKeywords: number): { withData: number; total: number; percent: number } {
  const trackedQueries = new Set(SEARCH_PERFORMANCE_RECORDS.map((record) => record.query.toLowerCase().trim()))
  return {
    withData: trackedQueries.size,
    total: totalKeywords,
    percent: totalKeywords === 0 ? 0 : Math.round((trackedQueries.size / totalKeywords) * 100),
  }
}
