# Funnel Architecture

Sprint W9-1. Source of truth: `src/lib/analytics/funnel.ts` (`WEBSITE_FUNNEL_STEPS`).

## The Website Funnel

```
Landing → Fabric → Configurator → Consultation → Measurement → Quotation → Order
```

Each step is a `WebsiteFunnelStep` (`src/lib/analytics/funnel.ts`), fired via `trackFunnelStep(step)`, which sends one `funnel_step` event carrying `funnel_step` (the name) and `funnel_step_index` (its position in the array above) — the CRO dashboard's funnel view groups on the index, so reordering display labels later can never silently break the funnel shape.

| Step | Real page(s) | Also fires |
|---|---|---|
| `landing` | `/` | `page_view` |
| `fabric` | `/fabric`, `/fabric/[category]`, `/fabric/[category]/[slug]` | `fabric_card_view`, `fabric_detail_open` |
| `configurator` | `/design-studio` (the merged pillar + configurator page) | `configurator_start` |
| `consultation` | `/book-appointment` (this project's real "Consultation" page) | `consultation_cta_click` |
| `measurement` | `workspace/measurement/[consultationId]` (fitter-facing; the event represents the *customer's* funnel progression, triggered by staff action — the only place a real measurement session happens in this system) | `measurement_started` / `measurement_completed` |
| `quotation` | Quotation generation (Commercial Engine) | `quotation_generated` |
| `order` | Order confirmation (`workspace/order-created/[orderId]`) | `order_confirmed` |

## Payment isn't a funnel step

The brief's own end-to-end description lists `Order → Payment`, but `payment_dp`/`payment_full` are tracked as **commercial events**, not a funnel step — payment can happen in multiple partial installments after an order is already confirmed (this project's real Commercial Engine supports DP + outstanding-balance flows; see `src/lib/commercial/summary.ts`), so it doesn't fit a single linear "step N" position the way Landing→Order does. `payment_dp`/`payment_full` should be read alongside the funnel, not as its final rung.

## Relationship to the pre-existing Design Studio events

`src/lib/configurator/analytics.ts` (predates this sprint) already fires its own event set into `window.dataLayer`. This sprint's `funnel`/`configurator` step doesn't replace it — both fire independently once wired into the same components. When building a real funnel report, de-duplicate at the reporting layer (e.g. treat either `configurator_start` or the old stub's `configurator_opened` as "entered configurator"), not by removing either event source.

## Why funnel data isn't in the dashboard yet

`src/lib/analytics/dashboardData.ts`'s `getCroDashboardData()` honestly returns `funnel: { available: false }` — funnel step counts live in GA4 event data, which requires the GA4 Data API (a real property + Google Cloud service account) to query from this app. See `KPI_DEFINITIONS.md` for the full list of what's real today vs. pending that connection.
