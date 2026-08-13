# Sprint W8-B — Local SEO Infrastructure + Appointment & Review Engine — Implementation Report

## Summary

Closed out the remaining Local SEO infrastructure on top of W8-1/W8-2/W8-3's foundation: NAP consistency now reaches the site footer (previously only location pages had it), every location page carries the full `Tailor + BreadcrumbList + FAQPage + Organization + WebSite + Service` schema set, a new `/contact` citation page exists, a review-request engine is live on every city page, and an appointment-generation layer (floating WhatsApp CTA + structured appointment form + UTM attribution) is wired into the location template. Everything reads from `CITY_BUSINESS` in `src/lib/seo/cityConfig.ts` — the same single source of truth established in W8-1 — so no address/phone string was ever re-typed.

No fabricated business data: the only two placeholders in this sprint (operating hours, Google Review URL) are ones the brief explicitly permitted as placeholders, and both are clearly marked `TODO_REAL_DATA` in code with a comment explaining exactly what needs replacing.

## New Files

- `src/app/contact/page.tsx` — `/contact` page (NAP, hours, map placeholder, breadcrumb + schema)
- `src/components/contact/ContactCard.tsx` — reusable contact card (address/WhatsApp/hours + Chat/Directions CTAs), reads only from `CITY_BUSINESS`
- `src/components/contact/MapPlaceholder.tsx` — structural Google Maps placeholder block (no Maps Embed API key exists) with a real, working "Buka di Google Maps" link
- `src/lib/seo/citations.ts` — `CitationData` structure (name, categories, address, phone, hours, geo, social profiles) shaped for future Google Business Profile / Apple Maps Connect / Bing Places / Yellow Pages submission, plus `citationToJSON()`
- `src/lib/reviews/reviewConfig.ts` — `GOOGLE_REVIEW_URL` (placeholder, see below) + `buildWhatsAppReviewRequestMessage()`
- `src/components/reviews/GoogleReviewCTA.tsx` — reusable review-request section
- `src/lib/seo/utm.ts` — `parseUtmParams()` / `appendUtmNote()`, threads Google Business Profile UTM traffic into WhatsApp message text (no analytics provider exists in this codebase to hook into instead — grepped first)
- `src/components/locations/CityStickyWhatsApp.tsx` — floating WhatsApp CTA (new; does not touch the existing homepage-only `StickyMobileCta.tsx`)
- `src/components/locations/AppointmentForm.tsx` — appointment block (nama/kota/jenis pakaian/tanggal acara), submits by composing a WhatsApp message client-side — no backend/DB table added

## Files Changed

- `src/app/locations/[city]/page.tsx` — added Organization/WebSite/Service schema; wired `searchParams` → `parseUtmParams` → `utm` prop through `CityHero`/`CityCTA`/`CityStickyWhatsApp`/`AppointmentForm`; added `GoogleReviewCTA`, `AppointmentForm`, `CityStickyWhatsApp` to the page composition
- `src/app/locations/page.tsx` — added Organization/WebSite schema to the hub
- `src/components/locations/CityHero.tsx` — added optional `utm` prop, appends UTM note to its WhatsApp message
- `src/components/locations/CityCTA.tsx` — same `utm` addition
- `src/components/marketing/shell/Footer.tsx` — **NAP Consistency System**: added an `<address>` block + WhatsApp link reading from `CITY_BUSINESS`, so the same NAP now appears sitewide (footer), not just on `/locations/*`
- `src/lib/marketing/copy.ts` — added "Locations" to `navCopy.links` and the footer's "Explore" column; added "Contact" to the footer's "Studio" column
- `src/lib/seo/cityConfig.ts` — added `REVIEW_FAQ_ITEM`, appended to every city's `faq` array (Bandung: 11 total; others: 4 total)
- `src/lib/sitemap/build.ts` — added `/contact`
- `scripts/seo-validate.ts` — new §1b: runs the *real* `CITY_CONFIGS` data through the *real* page-level schema builders and recursively checks for empty strings/arrays — the concrete "tidak ada field kosong" requirement, not just a shape check against sample data

## Schema Added

| Schema | Where | Notes |
|---|---|---|
| `Organization` | Every `/locations/*` page + `/contact` | Reused W7's `organizationSchema()` as-is |
| `WebSite` | Every `/locations/*` page + `/contact` | Reused W7's `websiteSchema()`, no SearchAction (still no search feature) |
| `Service` | Every `/locations/[city]` page | New — `areaServed: city.city`, `serviceType: 'Bespoke Tailoring'` |
| `Tailor` (LocalBusiness) | Every `/locations/*` page + `/contact` | Unchanged from W8-1/8-2/3 — real Bandung address always, `geo` only on Bandung |
| `BreadcrumbList` | Every `/locations/*` page + `/contact` | Unchanged |
| `FAQPage` | Every `/locations/[city]` page | Now includes the review-request FAQ item |

Verified live (local production build): `/contact` renders `Tailor/BreadcrumbList/Organization/WebSite/City/GeoCoordinates/PostalAddress`; `/locations/bandung` renders all 7 types including `Service` and the `LocalBusiness` nested inside `Service.provider`. `npm run seo:validate`'s new empty-field check passed for all 5 cities + the hub — zero empty strings/arrays anywhere in the real, data-driven schema output.

## Internal Linking Map

Unchanged from W8-2/3 (city↔city, Fabric Guide, Bespoke Process anchor, Measurement Guide, Consultation) — **plus this sprint**:
- Primary nav → `/locations` (new)
- Footer "Explore" column → `/locations` (new)
- Footer "Studio" column → `/contact` (new)
- Every location page's `GoogleReviewCTA` → `GOOGLE_REVIEW_URL`
- Every location page's floating `CityStickyWhatsApp` → WhatsApp (always-visible, not scroll-gated)

## Appointment Flow

1. Visitor lands on `/locations/{city}` — optionally via a Google Business Profile link carrying `?utm_source=google&utm_medium=gbp&utm_campaign=...`
2. `parseUtmParams(searchParams)` captures those params server-side, once, in the page component
3. `utm` is passed to `CityHero`, `CityCTA`, `CityStickyWhatsApp`, and `AppointmentForm` — each appends `(sumber: google/gbp/...)` to its own WhatsApp message via `appendUtmNote()`
4. Three conversion paths, all converging on WhatsApp:
   - **Hero CTA** — immediate, low-friction "Chat WhatsApp" button
   - **AppointmentForm** — nama/kota (pre-filled with the page's city, editable)/jenis pakaian/tanggal acara → composes a structured message client-side, opens `wa.me` in a new tab (no backend, no DB write — matches this project's "prefer existing RPCs, don't add new schema for a one-off form" rule)
   - **CityStickyWhatsApp** — always-visible floating button, bottom-right, both mobile and desktop
5. Verified live: UTM query params on `/locations/bandung?utm_source=google&utm_medium=gbp&utm_campaign=profile` correctly appear URL-encoded inside the rendered WhatsApp link (`sumber%3A%20google%2Fgbp%2Fprofile`)

## Review Flow

1. `CityReviews` (W8-2/3, unchanged) shows the real, existing testimonials, city-matched one surfaced first
2. `GoogleReviewCTA` immediately follows — "Tulis Ulasan di Google" button linking to `GOOGLE_REVIEW_URL`
3. `buildWhatsAppReviewRequestMessage()` is available for staff to send a post-delivery review request via WhatsApp (not auto-triggered — there's no order-completion event in this codebase to hook into; this is a ready-to-use message template, not an automated send)
4. Every city's FAQ now includes: *"Bagaimana cara memberi ulasan setelah pesanan selesai?"*

**TODO_REAL_DATA note**: `GOOGLE_REVIEW_URL` currently points at the same real Google Maps search URL (`CITY_MAPS_URL`) used for "Get Directions" — a genuine, working link — rather than a fabricated `writereview?placeid=...` deep link, since that requires a real Place ID from a claimed, verified Google Business Profile that doesn't exist yet. Swapping in the real deep link later only requires changing this one constant.

## Build Status

`npm run build` — **green**. `/contact` (new, static) and all `/locations/*` routes generated successfully alongside every existing route.

## Lint Status

`npm run lint` — **green** (one pre-existing warning, unrelated to this sprint).

## SEO Validation Status

`npm run seo:validate` — **all checks passed**, including the new empty-field validation (16 additional checks: Tailor/FAQPage/BreadcrumbList × 5 cities + hub) and `/contact`'s metadata/heading audit.

## Typecheck

`npx tsc --noEmit` — clean.

## Local Production Verification

- `/contact`, `/locations/bandung`, `/locations/jakarta`, `/` all return HTTP 200
- `/contact` renders the real NAP (`Jl. Gamelan No.10, Buah Batu, Bandung, Jawa Barat, Indonesia`, `+6285173334251`) and full schema set
- Homepage footer now renders the same real address — confirmed NAP consistency reaches beyond `/locations/*`
- Footer's "Locations" and "Contact" links present and correct
- `CityStickyWhatsApp`, `AppointmentForm`, and `GoogleReviewCTA` all confirmed rendering on `/locations/bandung`
- UTM params correctly threaded into the WhatsApp message URL
- `sitemap-pages.xml` includes `/contact`

## Suggested Commit Message

```
feat(seo): W8-B local SEO infrastructure + appointment & review engine

NAP Consistency: Footer.tsx now reads CITY_BUSINESS (the same single
source of truth every location page's schema/metadata/CTAs already use)
instead of having no address at all — the real NAP now appears
sitewide, not just on /locations/*.

Schema Expansion: every /locations/* page and the new /contact page
now carry Organization + WebSite (reusing the W7 builders as-is) and
Service (new, per-city areaServed) alongside the existing
Tailor/BreadcrumbList/FAQPage. seo-validate.ts gained a new check that
runs the real CITY_CONFIGS data through the real schema builders and
recursively verifies no empty string/array field exists anywhere.

Local Citation Infrastructure: new /contact page (ContactCard +
MapPlaceholder, both NAP-driven) and src/lib/seo/citations.ts — a
structured NAP+hours+categories object shaped for future Google
Business Profile / Apple Maps / Bing Places / Yellow Pages submission.
Operating hours are an explicitly-permitted TODO_REAL_DATA placeholder.

Review Engine: reusable GoogleReviewCTA component, a WhatsApp
review-request message template, and a real review-prompt FAQ item
added to every city. GOOGLE_REVIEW_URL is a working (not fabricated)
placeholder pointing at the real Maps listing until a verified Google
Business Profile Place ID exists.

Appointment Generation Layer: new floating CityStickyWhatsApp CTA and
a client-side AppointmentForm (nama/kota/jenis pakaian/tanggal acara)
that composes a WhatsApp message on submit — no backend or DB table
added. UTM params from Google Business traffic are captured server-side
and threaded into every WhatsApp CTA's message text via the new
src/lib/seo/utm.ts, since no analytics provider exists in this
codebase to hook into instead.

Internal linking: /locations and /contact added to primary nav/footer.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

Ready to commit, push, and deploy — awaiting your go-ahead, same as the prior W8 sprints.
