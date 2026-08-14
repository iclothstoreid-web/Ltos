# Reporting Playbook

Sprint W9-1. Source of truth: `src/lib/analytics/reporting.ts`.

## Generating a Report

```ts
import { createClient } from '@/lib/supabase/server'
import { generateAnalyticsReport, formatReportAsMarkdown } from '@/lib/analytics/reporting'

const supabase = createClient()
const report = await generateAnalyticsReport(supabase, 'weekly') // 'daily' | 'weekly' | 'monthly'
console.log(formatReportAsMarkdown(report))
```

`generateAnalyticsReport(supabase, period, referenceDate?)` returns an `AnalyticsReport` object; `formatReportAsMarkdown()` renders it as a ready-to-paste Markdown report. `referenceDate` defaults to now — pass an explicit date to regenerate a historical report for a specific day.

## What's Real in Every Report

- **Revenue** and **Orders Approved**: filtered from `getCommercialSummary()`'s `approvedQuotationRows` by real `approved_at` timestamps falling inside the report's date range — genuinely period-bounded, not an all-time total relabeled.
- **AOV**: Revenue ÷ Orders Approved for that same period.
- **Experiment Status**: live from `src/lib/experiments/registry.ts`.

## What's Not Yet in the Report

Visitor counts, funnel step counts, drop-off rates, and CTA/fabric engagement rankings all require the GA4 Data API (see `KPI_DEFINITIONS.md`'s "Pending is not fake" section) — every generated report includes an explicit `notes` array saying so, rather than omitting the topic silently or filling it with a placeholder number.

## Period Definitions

| Period | Range |
|---|---|
| `daily` | Last 24 hours from the reference date |
| `weekly` | Last 7 days from the reference date |
| `monthly` | Last 1 calendar month from the reference date |

(`getReportRange()` in `reporting.ts` — trailing windows, not calendar-aligned weeks/months. Switch to calendar-aligned boundaries here if the business wants "last Monday–Sunday" instead of "last 7 days" reporting.)

## Suggested Cadence (not yet automated)

This sprint ships the report *generator*, not a cron job or a scheduled delivery mechanism — no new background job was added (out of scope for §13, and this project has no existing cron/queue infrastructure to hook into safely without a separate decision on where that infrastructure would live). To use this today:

1. **Daily**: run manually (e.g. from a script, or a future `/owner/analytics` "export" button) each morning for yesterday's commercial numbers.
2. **Weekly**: run each Monday for the trailing 7 days — good cadence for reviewing experiment status changes alongside real revenue movement.
3. **Monthly**: run on the 1st for the trailing month — pair with the Executive Dashboard's live orders/revenue/AOV for a fuller picture once GA4 is connected.

## Once GA4 Is Connected

Extend `generateAnalyticsReport()` to also pull visitor/funnel/CTA data from the GA4 Data API and merge it into the same `AnalyticsReport` shape — the `notes` array entries documenting the gap should be removed at that point, not left as stale caveats.
