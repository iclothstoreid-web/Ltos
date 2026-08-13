# Sprint W8-1 — Location SEO Foundation — Implementation Report

## Summary

Built a scalable multi-city Local SEO foundation: 5 city landing pages (`/locations/bandung`, `/jakarta`, `/bekasi`, `/tangerang`, `/surabaya`) driven by one reusable template, a `/locations` internal-linking hub, a city configuration registry, a `LocalBusiness` schema generator, and a location-aware Next.js Metadata generator with geo tags. No existing marketing component was deleted or rewritten — new sections reuse existing primitives (`Reveal`, `MagneticButton`, `GoldAccentLine`, `LuxuryGradientField`) and reuse 3 existing homepage sections outright (`BespokeProcessSection`, `FabricHighlight`, `ReviewsSection`).

Two things needed a decision before writing any URLs, both resolved with you before implementation:

1. **Canonical domain**: the brief's locked business data lists `Website: https://localtailor.id`. That domain was confirmed (live fetch) to be a real, separate WordPress site for the same business — not connected to this Vercel project. Per your decision, every canonical/OG/schema URL in this sprint uses `https://ltos-local-tailor.vercel.app` (this app's actual deployed domain) instead, so the new pages are indexable and self-consistent rather than pointing at a different live site.
2. **No fake branch listings**: Local Tailor has one real physical address (Bandung). The Jakarta/Bekasi/Tangerang/Surabaya pages are service-area landing pages, not branches — their `LocalBusiness` schema always carries the real Bandung address and signals city targeting via `areaServed` only, never a fabricated address or map pin in a city with no physical presence. Geo coordinates (`geo.position`/ICBM/`GeoCoordinates`) are only emitted on the Bandung page, using a real street-level geocode looked up via OpenStreetMap Nominatim this sprint — not invented, and explicitly documented as street-level (not house-number-precise).

## Files Created / Changed

**New — config/schema/metadata layer:**
- `src/lib/seo/locations.ts` — `LocationConfig` registry for all 5 cities (hero copy, trust statement, FAQ, related-guide links), `LOCATION_BUSINESS` (locked business data + WhatsApp number normalized to international format), `LOCATION_GEO` (real geocode)
- `src/lib/seo/localBusiness.ts` — `buildLocationLocalBusinessSchema()`, `buildLocationsHubLocalBusinessSchema()`
- `src/lib/seo/locationMetadata.ts` — `buildLocationMetadata()`, `buildLocationsHubMetadata()` (title/description/canonical/OG/Twitter/robots + geo meta tags)

**New — components (`src/components/locations/`):**
- `LocationHero.tsx`, `LocalTrustSection.tsx`, `LocationServices.tsx`, `LocationPricing.tsx`, `LocationAppointmentCta.tsx`, `NearbyAreas.tsx`, `RelatedGuides.tsx`

**New — routes:**
- `src/app/locations/page.tsx` — hub page
- `src/app/locations/[city]/page.tsx` — template (generateStaticParams over all 5 cities)

**Modified:**
- `src/lib/sitemap/build.ts` — added `/locations` + all 5 city URLs to the pages sitemap (verified live in `sitemap-pages.xml`)

**Reused as-is, zero modification:**
- `src/components/marketing/sections/BespokeProcessSection.tsx` (Bespoke process)
- `src/components/marketing/sections/FabricHighlight.tsx` (Fabric section)
- `src/components/marketing/sections/ReviewsSection.tsx` (Reviews section — real existing reviews, honestly captioned; `ctaHref` overridden to `/gallery` since the default `/#gallery` anchor is homepage-only)
- `src/components/marketing/shell/{Nav,Footer,Reveal,MagneticButton}.tsx`, `placeholders/{GoldAccentLine,LuxuryGradientField}.tsx`
- `src/components/seo/{JsonLd,Breadcrumbs,FaqSection}.tsx` and `src/lib/seo/schema.ts` (from Sprint W7)

## Routing Added

| Route | Type |
|---|---|
| `/locations` | Static |
| `/locations/bandung` | SSG (real physical location) |
| `/locations/jakarta` | SSG (service-area) |
| `/locations/bekasi` | SSG (service-area) |
| `/locations/tangerang` | SSG (service-area) |
| `/locations/surabaya` | SSG (service-area) |

## Metadata Generated (per city page)

- `title`: `Custom Thobe {City} | Local Tailor`
- `description`: city-specific, derived from `heroSubheadline` + `trustStatement`
- `canonical`: `https://ltos-local-tailor.vercel.app/locations/{city}`
- `openGraph` (title/description/url/siteName/type=website), `twitter` (summary card)
- `robots`: index/follow
- `geo.placename`, `geo.region` (real ISO 3166-2:ID code, e.g. `ID-JB`) on every city
- `geo.position` + `ICBM` (real coordinates) — **Bandung only**

## Schema Generated (per city page)

- `Tailor` (schema.org's Store subtype for a made-to-order tailoring business — more accurate than `ClothingStore`, which implies off-the-shelf retail): real Bandung address always, `areaServed: {City}`, `geo` only on Bandung, no `priceRange` (made-to-order, quoted per consultation — same reasoning already established in `src/lib/materials/seo.ts`)
- `BreadcrumbList`: Home → Locations → {City}
- `FAQPage`: 3 city-specific Q&As, none asserting capabilities this business doesn't have (no same-day delivery claims, no fabricated order counts)

Hub page (`/locations`) gets its own `Tailor` schema (same `@id`, `areaServed` as the full city array) + `BreadcrumbList`.

## Validation

- `npm run seo:validate` — all checks pass, including the 2 new routes (`/locations`, `/locations/[city]`) picked up automatically by the file-walker
- Local production-server verification (port 4175): all 6 routes return HTTP 200; JSON-LD inspected directly via `curl` —confirmed Bandung's `Tailor` schema carries `geo`, Jakarta's does not (and correctly shows `areaServed: Jakarta` against the real Bandung address); `sitemap-pages.xml` lists all 6 new URLs

## Build Status

`npm run build` — **green**. `/locations` and `/locations/[city]` (5 static params: bandung, jakarta, bekasi, tangerang, surabaya) generated successfully alongside all existing routes.

## Lint Status

`npm run lint` — **green** (one pre-existing warning in `src/components/workspace/consultation-review/OpenTransactionPrompt.tsx`, unrelated to this sprint, not touched here).

## Typecheck

`npx tsc --noEmit` — clean, no errors. TypeScript strict, no `any` used anywhere in the new code.

## Ready for W8-2

The template, config registry, and schema/metadata generators are in place and city-agnostic — W8-2 (Bandung production page) can extend `LOCATIONS[0]` (the `isPrimary: true` entry) with richer, Bandung-specific content without touching the template's shape.

## Suggested Commit Message

```
feat(seo): W8-1 location SEO foundation — 5-city landing page template

New src/lib/seo/{locations,localBusiness,locationMetadata}.ts + a
src/app/locations/[city] template covering Bandung (real address) and
4 service-area cities (Jakarta/Bekasi/Tangerang/Surabaya). LocalBusiness
schema always carries the one real Bandung address + areaServed per
city — never a fabricated branch listing. Canonical/OG/schema URLs use
ltos-local-tailor.vercel.app (this app's actual domain), not the
locked localtailor.id business-data field, which resolves to a
separate, unrelated live WordPress site. Reuses BespokeProcessSection/
FabricHighlight/ReviewsSection and the W7 seo/ JsonLd+Breadcrumbs+
FaqSection components as-is. Sitemap updated with all 6 new URLs.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

Not yet committed, pushed, or deployed — per this sprint's brief, only build/lint verification and the report were requested. Let me know if you want it committed and shipped now.
