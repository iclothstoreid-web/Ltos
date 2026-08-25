# KPI Definitions

Sprint W9-1. Source of truth for what's real vs. pending: `src/lib/analytics/dashboardData.ts`.

## Executive Dashboard

| KPI | Definition | Data source | Status |
|---|---|---|---|
| Visitors | Unique `session_id`s with a `page_view` event in the period | GA4 Data API | **Pending** — needs GA4 property + Google Cloud service account |
| Consultations | Row count in the `consultations` table | Supabase (`consultations`) | **Live** |
| Measurements | Sessions with a `measurement_completed` event | GA4 Data API | **Pending** |
| Orders | Count of `quotations` with `status = 'approved'` | Supabase, via `getCommercialSummary()`'s `approvedQuotationRows` | **Live** |
| Revenue | Sum of `quotations.amount` where `status = 'approved'` | Supabase, via `getCommercialSummary()` | **Live** |
| AOV (Average Order Value) | Revenue ÷ Orders | Computed from the two rows above | **Live** |
| Conversion Rate | Orders ÷ Visitors | GA4 Data API (needs Visitors) | **Pending** |

**Why Orders/Revenue/AOV reuse `getCommercialSummary()`** rather than a new query: that function is the same one the existing Owner Dashboard already uses for its own Sales/Cash Collected figures (Sprint K Commercial Engine). Reusing it means these three KPIs can never silently drift from what Owner OS already shows for the same underlying data — see that file's own doc comment.

## CRO Dashboard

| KPI | Definition | Data source | Status |
|---|---|---|---|
| Funnel | Session counts per `WEBSITE_FUNNEL_STEPS` step | GA4 Data API (`funnel_step` events) | **Pending** |
| Drop-off | 1 − (sessions reaching step N+1 ÷ sessions reaching step N) | GA4 Data API | **Pending** |
| CTA Leaderboard | `cta_click` event counts grouped by `cta_id` (see `src/lib/analytics/cta.ts`'s `CTA_REGISTRY`) | GA4 Data API | **Pending** |
| Fabric Ranking | Materials sorted by `calculateFabricEngagement()` score | GA4 Data API (feeds the weighted formula in `src/lib/analytics/fabricEngagement.ts`) | **Pending** |
| Experiment Status | Registry entries + their current `status` | `src/lib/experiments/registry.ts` (local, not GA4) | **Live** |

## "Pending" is not "fake"

Every "Pending" row above renders as an explicit "not connected yet" state in the dashboard UI (`KpiCard`/`CroDashboard` components) — never a zero, placeholder number, or invented figure standing in for real data. Populating these requires:

1. A real GA4 property — provisioned as of Sprint W10.x (`G-5354BZ93Z6`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID` set in production); the tracking pipeline now sends events, but nothing below yet reads them back
2. The GA4 Data API enabled on that property, with a Google Cloud service account credentialed to query it
3. A server-side data-fetching module added to `src/lib/analytics/` that calls that API (out of scope for this sprint — the brief's own §1 only asks for the *tracking* pipeline, not the reporting-API integration)

## Fabric Engagement Score

`calculateFabricEngagement()` (`src/lib/analytics/fabricEngagement.ts`) is a transparent, documented weighted sum — not a black-box model:

```
score = cardViews × 1
      + detailOpens × 3
      + compareCount × 4
      + saveCount × 6
      + ctaClicks × 10
      + (timeSpentMs / 60000) × 2
```

Weights increase with purchase intent (a save or CTA click signals far more than a passive card view). These weights are a starting point, not a tuned model — revisit once real engagement data exists to compare against actual conversion outcomes.
