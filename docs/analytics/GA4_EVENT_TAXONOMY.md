# GA4 Event Taxonomy

Sprint W9-1. Source of truth: `src/lib/analytics/events.ts` (`GA4_EVENTS`). If this document and that file ever disagree, the code is correct — this document should be regenerated from it.

## Status

No GA4 property has been provisioned for this project yet (`NEXT_PUBLIC_GA4_MEASUREMENT_ID` is unset — see `src/lib/analytics/constants.ts`). Every event below is real, tested, functioning code (`npx tsx` verified — see the implementation report) that fires the moment a real measurement ID is set in the deployment environment. Until then, every call logs to the browser console (`[analytics] event_name {...}`) instead of sending to GA4 — see `tracker.ts`'s `debugLog`.

## Standard Parameters

Every event carries these when available (never sent as empty strings — omitted if unresolved):

| Param | Source |
|---|---|
| `session_id` | Generated once per browser session, persisted in `sessionStorage` |
| `user_id` | Passed by the caller when a real staff/customer identity applies |
| `customer_token` | Passed by the caller on customer-token-gated pages (e.g. `/journey/[customerToken]`) |
| `city` | Passed by the caller (e.g. location pages) |
| `device` | Derived from `window.innerWidth` (`mobile` / `tablet` / `desktop`) |
| `traffic_source` | From the attribution layer's last-touch (see `ATTRIBUTION_MODEL.md`) |
| `campaign` | From the attribution layer's last-touch |
| `page_type` | One of the closed `PageType` union — see `src/lib/analytics/types.ts` |

## Landing

| Event | Fires when |
|---|---|
| `page_view` | Once per navigation, from `AnalyticsProvider`'s pathname-change effect |
| `hero_view` | Hero section enters the viewport (wire via `IntersectionObserver` at integration time) |
| `hero_cta_click` | Primary/secondary hero CTA clicked |

## Scroll

| Event | Fires when |
|---|---|
| `scroll_25` / `scroll_50` / `scroll_75` / `scroll_100` | Scroll position crosses each threshold, once per page load — see `src/lib/analytics/scroll.ts` |

## Fabric

| Event | Fires when |
|---|---|
| `fabric_card_view` | A fabric card renders in a visible position |
| `fabric_detail_open` | A material detail page/modal opens |
| `fabric_filter_use` | A category/texture/season filter is applied |
| `fabric_compare` | Two or more materials are compared |

## Lookbook

| Event | Fires when |
|---|---|
| `lookbook_open` | The Lookbook (this project's real equivalent: `/gallery`) opens |

## Design Studio

| Event | Fires when |
|---|---|
| `configurator_start` | The configurator mounts / a visitor begins a session |
| `fabric_selected` / `collar_selected` / `cuff_selected` / `embroidery_selected` | Each selector changes — see `src/lib/analytics/designStudioAnalytics.ts` |
| `configurator_complete` | A design is saved/finalized, carries `total_options_selected` |
| `configurator_exit` | The visitor leaves before completing, carries `exit_step` + `total_options_selected` |

**Note**: `src/lib/configurator/analytics.ts` (pre-existing, predates this sprint) already fires a broader, differently-named event set (`model_selected`, `color_selected`, `embroidery_added`, `price_estimated`, etc.) into `window.dataLayer` as a GTM-style stub. That module is untouched by this sprint — both fire independently once wired into the same components (see `FUNNEL_ARCHITECTURE.md`'s integration note).

## Consultation

| Event | Fires when |
|---|---|
| `consultation_cta_click` | A "Book Appointment" / "Book Free Video Call" CTA is clicked |
| `consultation_form_open` | A booking/consultation form opens |
| `consultation_form_submit` | The form is submitted |
| `consultation_scheduled` | A session is confirmed scheduled |
| `consultation_attended` | Staff mark a consultation as attended (internal trigger) |

## Measurement

| Event | Fires when |
|---|---|
| `measurement_started` | A fitter begins a measurement session (`workspace/measurement`) |
| `measurement_completed` | The measurement session is saved |

## Commercial

| Event | Fires when |
|---|---|
| `quotation_generated` | A quotation is created |
| `order_confirmed` | An order is confirmed |
| `payment_dp` | A down-payment is recorded |
| `payment_full` | Full payment is recorded |

## CTA / Fabric Engagement / Experiments / Funnel (additive, beyond §2's literal list)

These event names support §4/§5/§7/§10's own required helpers and aren't duplicates of anything above — see `events.ts`'s inline comments for why each exists:

| Event | Module |
|---|---|
| `cta_click` | `src/lib/analytics/cta.ts` — `trackCTA(id, page, position)` |
| `fabric_save` / `fabric_time_spent` | `src/lib/analytics/fabricEngagement.ts` |
| `experiment_exposure` | `src/lib/experiments/exposure.ts` |
| `funnel_step` | `src/lib/analytics/funnel.ts` |

## Heatmap Signals (Microsoft Clarity, not a GA4 event)

Rage click, dead click, excessive scrolling, and session replay are captured automatically by Clarity once `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set — no custom event needed for these. See `src/lib/analytics/heatmap.ts`'s comment for why this sprint didn't hand-roll rage-click detection.

## Duplicate-Name Guard

`events.ts` runs `assertNoDuplicateEventNames()` at module load — if any future edit introduces two different category keys resolving to the same string, every page that imports the module throws immediately (verified locally via `npx tsx`, and it runs again on every `next build`).
