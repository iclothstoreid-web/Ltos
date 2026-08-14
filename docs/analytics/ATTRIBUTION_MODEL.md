# Attribution Model

Sprint W9-1. Source of truth: `src/lib/analytics/attribution.ts`.

## Model

**First-touch and last-touch, both stored, client-side only.** No server round-trip, no new Supabase table — this is marketing attribution, not an order-of-record, so `localStorage` is the correct persistence layer (same reasoning `experiments/assignment.ts` uses for sticky variant bucketing).

- **First-touch** (`ltos_first_touch`): written once, on the visitor's very first page load that has attribution data to capture. Never overwritten after that — answers "what originally brought this visitor to the site."
- **Last-touch** (`ltos_last_touch`): overwritten on every page load. Answers "what brought this visitor back most recently" — this is what `tracker.ts` attaches to every event's `traffic_source`/`campaign` params, since it's the more actionable signal for "what's driving today's session."

Both are captured by `captureAttribution()`, called once per page load from `AnalyticsProvider`.

## UTM Parsing

`parseUtmParams()` reads `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` from the URL. When no UTM params are present, it falls back to `document.referrer`'s hostname as `source` (medium: `referral`) — a real referring site still deserves real attribution, not a blanket "direct." Only a visit with neither UTM params nor a referrer (a typed URL, a bookmark, or a link from an app that strips referrers) becomes `direct` / `none`.

## Source / Medium Normalization

Raw UTM values and referrer hostnames are normalized to a small canonical vocabulary so a report never shows `google.com`, `Google`, and `google` as three different rows:

| Raw | Normalized source |
|---|---|
| `google.com`, `www.google.com` | `google` |
| `m.facebook.com`, `www.facebook.com`, `l.facebook.com` | `facebook` |
| `instagram.com`, `l.instagram.com` | `instagram` |
| `wa.me`, `api.whatsapp.com` | `whatsapp` |
| `business.google.com`, `gbp` | `google_business` |

Same pattern for `medium` (`cpc`/`ppc`/`paid` → `cpc`; `local`/`gbp` → `local`; etc.) — see `SOURCE_ALIASES`/`MEDIUM_ALIASES` in `attribution.ts` for the full, current list. Unrecognized values pass through lowercased rather than being dropped, so a genuinely new source still shows up in reports (just un-grouped) instead of silently disappearing.

## Google Business Profile Traffic

Sprint W8-B's `src/lib/seo/utm.ts` already captures `utm_source`/`utm_medium`/`utm_campaign` server-side on `/locations/[city]` and threads them into WhatsApp CTA message text (so a human can see attribution even without an analytics dashboard). This sprint's `attribution.ts` is the client-side, sitewide counterpart — the same UTM convention (`utm_source=google&utm_medium=gbp`, normalized to `google_business`) works across both.

## Session Attribution

`session_id` (see `tracker.ts`) is generated once per browser session (`sessionStorage`, cleared when the tab/browser session ends) and attached to every event — this is what lets a GA4 report (once connected) group events into sessions and compute session-level funnel progression, independent of the longer-lived first/last-touch identity in `localStorage`.
