# Sprint W7 — AI SEO & Structured Data Layer — Final Report

**Status: CLOSED** (W7-7 Author System deferred to Sprint W7.1 — see Deferred Items)

## Executive Summary

Sprint W7 built a reusable, site-wide JSON-LD/structured-data layer (`src/lib/seo/`, `src/components/seo/`) and used it to close real gaps left over from prior sprints: the homepage was missing `Organization` schema, `/design-studio` had no canonical/OG/robots metadata and no `Service` schema, and four marketing pages (`/book-appointment`, `/journal`, `/gallery`, `/free-body-profile-estimator`) had no visible breadcrumb navigation or `BreadcrumbList` schema.

This sprint deliberately did **not** rewrite the substantial SEO infrastructure already shipped in prior sprints (W0.5, W3-3..W3-6, W4.5, W6-1..W6-10) — `src/lib/marketing/seo.ts`, `src/lib/materials/seo.ts`, `src/lib/content/seo.ts`, `src/lib/knowledge/seo.ts` already carry live `Article`/`FAQPage`/`HowTo`/`BreadcrumbList`/`Product`/`Organization`/`CollectionPage` schema across the Knowledge base (86 articles, 7 categories), the Fabric Explorer, and the W0.5 sizing-guide cluster. The new `src/lib/seo/schema.ts` is the generic layer new pages reach for going forward; it sits alongside those modules, not on top of them.

Two W7 sub-items were scoped down after an explicit decision with the user before implementation began:

- **W7-3/W7-4 service pages** (Custom Thobe Premium, Wedding Thobe, Umrah Thobe, /pricing, /consultation) — these routes don't exist in the codebase. Rather than build four new marketing pages under an "SEO sprint," schema and FAQ content was applied to the closest real, live equivalents: `/design-studio` (Service schema), `/book-appointment` (FAQ as the real consultation-booking page), and the existing `/knowledge/wedding` and `/knowledge/umrah` articles (which already carry Article + FAQPage schema from Sprint W6).
- **W7-7 Author System** — deferred entirely, no placeholder built. See below.

## Files Changed

New:
- `src/lib/seo/schema.ts` — generic builders: `organizationSchema`, `localBusinessSchema`, `websiteSchema`, `breadcrumbSchema`, `productSchema`, `serviceSchema`, `faqSchema`, `howToSchema`, `personSchema`, `articleSchema`
- `src/lib/seo/entities.ts` — knowledge graph entity registry (primary entity + 10 secondary entities)
- `src/components/seo/JsonLd.tsx` — reusable JSON-LD `<script>` renderer (accepts one schema, an array, or null/undefined)
- `src/components/seo/Breadcrumbs.tsx` — generic breadcrumb nav
- `src/components/seo/FaqSection.tsx` — generic FAQ section (visible markup, source-synced with `faqSchema()`)
- `src/components/seo/AICitationBlock.tsx` — AI-answer-engine-friendly quotable summary block
- `scripts/seo-validate.ts` — static validation (`npm run seo:validate`)
- `SEO_AI_VALIDATION_CHECKLIST.md`
- `SEO_KNOWLEDGE_GRAPH.md`

Modified:
- `src/components/marketing/HomePage.tsx` — added `Organization` schema, refactored raw `<script>` tags to `<JsonLd>`
- `src/components/marketing/sections/Faq.tsx` — refactored to `<JsonLd>`
- `src/app/design-studio/page.tsx` — hardcoded metadata replaced with `buildSimplePageMetadata` (canonical/OG/Twitter/robots), added `Service` + `BreadcrumbList` schema (JSON-LD only — no visible layout change to the configurator tool)
- `src/app/book-appointment/page.tsx` — added visible breadcrumb nav, 5-item FAQ section + `FAQPage` schema, `BreadcrumbList` schema, root `<div>` → `<main>` landmark fix
- `src/app/journal/page.tsx` — added breadcrumb nav + schema, root `<div>` → `<main>` fix
- `src/app/gallery/page.tsx` — added breadcrumb nav + schema
- `src/app/free-body-profile-estimator/page.tsx` — added breadcrumb nav + schema, refactored existing schema to `<JsonLd>`
- `package.json` — added `seo:validate` script

## Schema Coverage

| Schema type | Where (new this sprint) | Where (already live, untouched) |
|---|---|---|
| Organization | Homepage | `/free-body-profile-estimator`, every `/knowledge/*` article |
| LocalBusiness | *(unchanged)* | Homepage, `/free-body-profile-estimator`, every `/knowledge/*` article |
| WebSite | *(unchanged)* | Homepage |
| BreadcrumbList | `/design-studio`, `/book-appointment`, `/journal`, `/gallery`, `/free-body-profile-estimator` | Every `/knowledge/*` and `/fabric/*` page |
| Service | `/design-studio` | — |
| Product | — | Every `/fabric/[category]/[slug]` material page |
| FAQPage | `/book-appointment` | Homepage, every W0.5 guide, every `/knowledge/*` article with FAQ content |
| HowTo | — | `/cara-mengukur-thobe`, `/knowledge/measurements/{how-to-measure-body,chest,shoulder,sleeve,length,neck}` |
| Article | — | W0.5 guides, every `/knowledge/*` article |
| Person | — *(deferred, see below)* | — |

## Pages Covered

Directly touched this sprint: `/`, `/design-studio`, `/book-appointment`, `/journal`, `/gallery`, `/free-body-profile-estimator`.

Verified already covered from prior sprints (no changes needed): `/cek-ukuran-thobe`, `/ukuran-thobe-pria`, `/cara-mengukur-thobe`, `/size-chart-thobe`, `/knowledge`, `/knowledge/[category]`, `/knowledge/[category]/[slug]` (86 articles), `/fabric`, `/fabric/[category]`, `/fabric/[category]/[slug]`.

Explicitly out of scope: `/owner/*`, `/workspace/*`, `/inventory/*`, `/production/*`, `/fitter/*`, `/command-center/*`, `/login`, `/api/*` (staff/internal, disallowed in `robots.ts`), and `/journey/[customerToken]` (customer-token-gated per-order tracking page, same category as `/production` — not a marketing page, not meant to rank).

## AI Discoverability Improvements

- **Entity consistency**: `src/lib/seo/entities.ts` gives the site one canonical description of "Local Tailor" and 10 secondary entities (Bespoke Thobe, Custom Thobe, Made-to-Measure Thobe, Premium Cotton Thobe, Linen Thobe, Wedding Thobe, Umrah Thobe, Bandung Tailor, Thobe Measurement, Islamic Menswear), each mapped to its real primary page and related internal links — see `SEO_KNOWLEDGE_GRAPH.md`.
- **Organization schema on homepage** closes the single biggest missing signal for "who is this business" — previously only `LocalBusiness`/`WebSite` existed there.
- **Service schema on Design Studio** — the site's actual booking/configuration entry point now identifies itself as a `Service` with a `LocalBusiness` provider, not just an untyped page.
- **Breadcrumb coverage** extended to every marketing page that lacked it, giving AI crawlers a consistent site hierarchy signal site-wide, not just within `/knowledge` and `/fabric`.
- **AICitationBlock component** (`src/components/seo/AICitationBlock.tsx`) is available for future pages that want a short, structurally isolated, quotable answer block — the pattern AI Overview/Perplexity-style extractive summarization favors. Not yet wired into a page this sprint (no page currently needs a bolt-on summary that the existing `QuickAnswer`/content structure doesn't already provide).
- **No fabricated trust signals**: `sameAs` (social profiles), `logo`, `SearchAction`, `aggregateRating`, and fixed `price` were all deliberately omitted everywhere, because none of the underlying real data exists yet. Emitting them would be exactly the kind of manipulative E-E-A-T/rich-result signal Google's own guidance flags — see `SEO_AI_VALIDATION_CHECKLIST.md`'s "Known, Deliberate Gaps" section.

## Validation Status

`npm run seo:validate` — **48/48 checks passed**:
- All 11 generic schema builders return correct `@context`/`@type`/required fields
- `faqSchema([])` correctly returns `null` (never emits an empty `FAQPage`)
- All 19 scanned public `page.tsx` routes have a `metadata` export or `generateMetadata()`
- No public page has more than one `<h1>` in its own source (heuristic — child-component h1s aren't visible to a static scan; noted in the checklist as a manual follow-up item)

Local runtime verification: production build started on ports 4173/4174, homepage/`book-appointment`/`design-studio` all returned HTTP 200, and the rendered JSON-LD was inspected directly (`curl` + grep) to confirm `LocalBusiness`/`WebSite`/`Organization`/`FAQPage` on the homepage and `Service`/`BreadcrumbList` on Design Studio render exactly as expected, with the `Service` schema's nested `provider.@type: LocalBusiness` correctly distinguished from a duplicate top-level schema block.

## Build Status

`npm run build` — **green**. 175 routes generated successfully, all `/knowledge/*` and `/fabric/*` static params pre-rendered.

## Lint Status

`npm run lint` — **green** (one pre-existing warning in `src/components/workspace/consultation-review/OpenTransactionPrompt.tsx`, unrelated to this sprint — a missing `useEffect` dependency, not touched by this work).

## Deployment

- **Commit**: `8b7ae79392dba74be6ec8b9566e6802fea011e25`
- **Branch**: `main`
- **Vercel deployment ID**: `dpl_GMhqrfQ9dDK5uXHVRziGVwfagtL7`
- **Production URL**: https://ltos-local-tailor.vercel.app

## Deferred Items

### Deferred: W7-7 Author System

Ditunda menjadi Sprint W7.1 karena menunggu bio asli, pengalaman, expertise, dan metadata Person yang tervalidasi. Tidak ada placeholder yang dibuat demi menjaga integritas E-E-A-T.

### Deferred: W7-3/W7-4 dedicated service/pricing/consultation pages

Custom Thobe Premium, Wedding Thobe, Umrah Thobe, `/pricing`, and `/consultation` as standalone marketing pages were not built — by explicit decision with the user, this sprint applied schema to the closest existing real pages instead (`/design-studio`, `/book-appointment`, `/knowledge/wedding`, `/knowledge/umrah`) rather than expand scope into new page creation. If dedicated pages are wanted, that's new marketing-page work, not a structured-data task.

### Deferred: AICitationBlock adoption

Component is built and available but not yet wired into any page — no current page has a clear gap it fills beyond what `QuickAnswer`/existing content blocks already provide.
