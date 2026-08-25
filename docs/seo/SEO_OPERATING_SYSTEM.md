# SEO Operating System

Sprint W10 — Organic Acquisition Engine, Task 7. The recurring workflow loop for operating (not just launching) the organic acquisition layer this sprint built, plus the dashboard KPIs to track it. This is a process document — it does not itself add tracking code; it describes how to use what W9-1 (analytics) and W10 (landing pages, this doc's sibling `SEARCH_CONSOLE_SETUP.md`) already shipped.

## The loop

```
Keyword → Landing Page → Internal Link → Indexing → Ranking → Optimization → Conversion Review
   │            │              │             │           │            │                │
   │            │              │             │           │            │                └─ back to Keyword
   ▼            ▼              ▼             ▼           ▼            ▼
SEO_KEYWORD_   Revenue     ServiceRelated  Search      Search       CTR/Query
MAP.md         Landing     Links.tsx +     Console     Console      workflows in
(this repo)    Pages       RelatedServ-    URL         Performance  SEARCH_CONSOLE_
               (5, W10)    icesLinks.tsx   Inspection  report       SETUP.md
```

1. **Keyword** — every new commercial keyword worth targeting starts as a row in `SEO_KEYWORD_MAP.md`, classified Ready to Buy / Compare / Research (see that doc). Do not skip this step and write a page directly from a guess.
2. **Landing Page** — Ready to Buy keywords get a page (currently `SERVICE_CONFIGS` in `src/lib/seo/serviceConfig.ts`, rendered by the shared `RevenueLandingPage.tsx` template). Compare/Research keywords are served by the existing Knowledge Engine (`src/lib/knowledge/`) — a new landing page is not the default answer for every keyword.
3. **Internal Link** — every new page must be reachable within the existing link graph before it's indexed: landing pages link to and from Knowledge articles, Design Studio, and sibling landing pages (`ServiceRelatedLinks.tsx`); Knowledge and Design Studio link back to landing pages (`RelatedServicesLinks.tsx`). See "Internal Linking Engine" in the W10 final report for the current link count.
4. **Indexing** — follow `SEARCH_CONSOLE_SETUP.md` §3–4 (URL Inspection + the indexing checklist) for every new page.
5. **Ranking** — wait for Search Console Performance data (2–4 weeks minimum for stable numbers), tracked per query/page.
6. **Optimization** — `SEARCH_CONSOLE_SETUP.md` §5–6 (CTR workflow for high-impression/low-CTR queries, Query workflow for high-impression/low-position queries).
7. **Conversion Review** — close the loop by checking whether ranking + traffic actually converted (§"Dashboard KPIs" below). A page that ranks but doesn't convert feeds back into Keyword/Landing-Page decisions (e.g. the CTA copy or WhatsApp message needs work, not the ranking).

## Cadence

This is a process document, not a cron job — there is no automated scheduler in this codebase running this loop. Suggested manual cadence for whoever owns this:

| Step | Suggested frequency |
|---|---|
| Keyword map review | Monthly, or whenever a new service/garment line is added |
| New landing pages | As Ready-to-Buy keywords are identified — not a fixed schedule |
| Internal link audit | Whenever a new page is added (check it's linked from ≥1 existing indexed page) |
| Search Console indexing check | Weekly for the first month after a new page ships, then monthly |
| Ranking review | Monthly (Search Console Performance, trailing 28 days) |
| CTR/Query optimization pass | Monthly, one page at a time (see `SEARCH_CONSOLE_SETUP.md` §5's "don't change more than one page per cycle" rule) |
| Conversion review | Monthly, cross-referencing Search Console traffic against the KPIs below |

## Dashboard KPIs

| KPI | Definition | Data source | Status |
|---|---|---|---|
| Organic sessions | Sessions where the landing page's traffic source is organic search | GA4 Data API, filtered by `source/medium = google/organic` | **Pending** — same GA4 Data API gap as every other GA4-sourced KPI in `docs/analytics/KPI_DEFINITIONS.md` (`NEXT_PUBLIC_GA4_MEASUREMENT_ID` is now configured in production as of Sprint W10.x, but no GA4 Data API service account is wired yet) |
| Ranking keywords | Count of distinct queries with impressions in Search Console Performance | Search Console Performance API (not connected — see `SEARCH_CONSOLE_SETUP.md`) | **Pending** |
| WhatsApp clicks | `cta_click` events where `cta_id` starts with `service_hero_whatsapp_`, `service_cta_whatsapp_`, or `service_sticky_whatsapp_` (20 registered ids across the 5 landing pages, see `CTA_REGISTRY` in `src/lib/analytics/cta.ts`) | GA4 Data API | **Pending** (event *tracking* is live in the client — client-side `trackCTA()` calls fire today; only the *reporting* API pull is pending, same distinction `KPI_DEFINITIONS.md` draws for the CRO dashboard's CTA Leaderboard) |
| Consultation bookings | Row count in the `consultations` table, filterable by referring landing page if UTM/referrer is captured at booking time | Supabase (`consultations`) | **Live** — this table already exists and is queried elsewhere (see `KPI_DEFINITIONS.md`'s Executive Dashboard); attributing a specific booking back to a specific landing page depends on the UTM-in-WhatsApp-message pattern (`src/lib/seo/utm.ts`'s `appendUtmNote()`), which is a text note in the WhatsApp message, not a structured, queryable field — so per-page attribution today means manually reading WhatsApp conversation text, not a dashboard number |
| Conversion rate | Consultation bookings attributable to a landing page ÷ that page's organic sessions | Computed from the two rows above | **Pending** (blocked on both inputs above) |
| Top revenue page | The landing page with the most attributed consultation bookings (or, once available, actual `quotations`/orders) | Same attribution gap as Consultation bookings | **Pending** |

**"Pending" is not "fake"** — same convention as `docs/analytics/KPI_DEFINITIONS.md`. Every Pending row above is blocked on a real, named integration gap (GA4 Data API service account, Search Console API, or structured UTM-to-booking attribution), not on missing client-side tracking code. The client-side tracking Sprint W10 added (`trackCTA()` calls, `FunnelStepOnMount`, `EventOnMount` on every landing page) is live today; what's missing is the server-side reporting pull that turns those raw events into dashboard numbers.

## What would close the "Pending" gaps

Not in scope for this sprint — recorded here so the next sprint that picks this up doesn't have to re-derive it:

1. A GA4 Data API server module + service account credential (the property and `NEXT_PUBLIC_GA4_MEASUREMENT_ID` are now provisioned as of Sprint W10.x; mirrors the gap already documented in `docs/analytics/KPI_DEFINITIONS.md`).
2. A verified Search Console property (see `SEARCH_CONSOLE_SETUP.md` §1, including resolving the `localtailor.id` vs. Vercel-URL canonical-domain question first) + Search Console API credentials for programmatic Performance-report pulls, instead of manual UI checks.
3. Replacing the free-text UTM-in-WhatsApp-message pattern with a structured field (e.g. a `source_landing_page` column captured at consultation-creation time) if per-page conversion attribution needs to become a real dashboard number rather than a manual read of message text.
