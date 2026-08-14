# Google Search Console Setup

Sprint W10 — Organic Acquisition Engine, Task 6. This is a **setup + operating playbook**, not a record of an already-connected property. As of this sprint, no Google Search Console property has been verified for this site inside this codebase — there is no API credential, no service account, and no automated indexing pipeline. Everything below is a manual workflow for whoever owns Search Console access to execute, plus the exact URLs/values this codebase already produces for them to use.

## 1. Property setup

**Domain to verify:** `https://ltos-local-tailor.vercel.app` — the one locked canonical domain this codebase uses for every canonical URL, Open Graph tag, and schema.org `url`/`@id` field (see `FABRIC_SITE_ORIGIN` / `CITY_SITE_ORIGIN` in `src/lib/materials/seo.ts` / `src/lib/seo/cityConfig.ts`).

> **Known discrepancy to resolve before going live with Search Console:** the business also has a separate, currently-live WordPress site at `localtailor.id` (confirmed live as of this sprint via a direct fetch). If `localtailor.id` is the domain the business actually wants ranking in Google, Search Console must be set up against **that** domain, not the Vercel deployment URL — and a decision is needed on canonicalization (redirect one to the other, or run both with `rel=canonical` pointing at whichever is authoritative) before submitting sitemaps. This codebase currently has no redirect or cross-domain canonical wired between the two; that is out of scope for this sprint and is called out explicitly rather than silently assumed.

Setup steps (Search Console UI, done by a human with domain/DNS or Vercel access — not automatable from this repo):

1. Add property in Search Console as a **URL-prefix property**: `https://ltos-local-tailor.vercel.app` (URL-prefix, not Domain property, since this is a Vercel subdomain, not a domain the business controls DNS for in a way that supports a Domain-property TXT/DNS verification in all cases — use HTML-tag or Vercel-hosted verification file instead).
2. Verify ownership via the **HTML tag** method (add a `<meta name="google-site-verification">` tag to `src/app/layout.tsx`'s `<head>` metadata) or the **HTML file** method (drop the verification file into `public/` — Next.js serves anything in `public/` at the root).
3. Once the `localtailor.id` vs. Vercel-URL decision above is made, repeat property setup for whichever domain(s) are kept live.

## 2. Sitemap submission

This codebase already produces a full sitemap index — nothing new was built for this sprint's Task 6 beyond adding the 5 new landing pages to the existing pipeline (Task 4). Submit these exact URLs in Search Console → Sitemaps:

| Sitemap | URL | Contents |
|---|---|---|
| Index | `/sitemap.xml` | Points to the 3 sitemaps below |
| Pages | `/sitemap-pages.xml` | Homepage, Design Studio, Fabric Explorer + all materials, estimator, W0.5 articles, `/locations` + all cities, `/contact`, **and (new this sprint) all 5 Revenue Landing Pages** |
| Knowledge | `/sitemap-knowledge.xml` | `/knowledge` landing, all categories, all articles |
| Images | `/sitemap-images.xml` | Homepage + material hero images (deliberately excludes Knowledge/landing pages — no real photography exists for those pages yet, see `src/lib/sitemap/build.ts`'s own comment) |

Submit only `/sitemap.xml` — Search Console follows the index to the other three automatically. Re-submission is not required after future content changes (Search Console re-crawls on its own schedule); only re-submit if a sitemap starts returning errors.

## 3. URL inspection workflow

For the 5 new Revenue Landing Pages specifically (`/bespoke-tailor-bandung`, `/tailor-premium-bandung`, `/jahit-thobe-bandung`, `/custom-baju-koko-bandung`, `/tailor-baju-umroh-bandung`), after the next production deploy:

1. Search Console → URL Inspection → paste the full URL.
2. Confirm "URL is on Google" or use **Request Indexing** if not yet crawled — do this once per page immediately after first deploy, not repeatedly (repeated manual requests don't speed up re-crawl and can look like spam signals).
3. Check the inspection result's **Coverage** panel confirms: no canonical conflict (should show the page's own URL as the user-declared *and* Google-selected canonical — each page's `buildServiceMetadata()` sets a self-referencing canonical), no `noindex` (none of these pages set one), mobile-usable (site is mobile-first by construction, see Walnut Atelier design system).
4. Check the **Enhancements** panel picks up the structured data this sprint added: `BreadcrumbList`, `FAQPage`, and the `Tailor` (LocalBusiness subtype) schema. If a page shows a schema error, it is almost certainly a source-data issue in `src/lib/seo/serviceConfig.ts` (e.g. an empty FAQ answer) rather than a template bug, since all 5 pages share one template (`RevenueLandingPage.tsx`).

## 4. Indexing checklist (per new page, before/after deploy)

- [ ] Page returns HTTP 200 (not a redirect, not 404) at its final production URL
- [ ] `<title>` and meta description are unique sitewide (verify no other page's `buildServiceMetadata`/`buildLocationMetadata`/`buildKnowledgeLandingMetadata` produces the same string — each of the 5 new pages has a distinct `keywordPrimary`, see `SEO_KEYWORD_MAP.md`)
- [ ] Canonical URL is self-referencing (not pointing at `/locations/bandung` or another landing page)
- [ ] robots.txt does not disallow the path (`src/app/robots.ts`'s disallow list is staff-tool routes only — `/bespoke-tailor-bandung` etc. are not in it)
- [ ] Page is reachable from at least one internal link crawlable without JS (the Nav/Footer don't link these pages directly by design — the brief's own internal-linking requirement routes through Knowledge/Design Studio/sibling pages instead; confirm at least one of those referring pages is itself indexed)
- [ ] Submitted via URL Inspection → Request Indexing once

## 5. CTR optimization workflow

Once Search Console has ≥2–4 weeks of impression data for a page (Google's own minimum for stable Performance-report numbers):

1. Search Console → Performance → filter by page URL → sort queries by Impressions descending.
2. For any query with high impressions but CTR well below the position's typical average (roughly: position 1–3 should see 20%+ CTR, position 4–10 more like 3–10% — these are industry rules of thumb, not a number this codebase measures), the title/meta description is the lever — not the page content itself.
3. Update the relevant `ServiceConfig.hero.headline` / the page's meta description (currently built from `hero.subheadline` in `buildServiceMetadata()`) to better match the query's actual phrasing, then re-request indexing for that one URL.
4. Do not change more than one page's title/description per review cycle — otherwise a CTR change can't be attributed to a specific edit.

## 6. Query optimization workflow

For queries appearing in Performance with impressions but position > 10 (page 2+, effectively invisible):

1. Check whether the query is already covered by an existing page's `keywordSecondary` array (`serviceConfig.ts` / `cityConfig.ts`) or is a genuinely new query intent not yet targeted anywhere — cross-reference `SEO_KEYWORD_MAP.md`.
2. If it's a known secondary keyword ranking poorly: strengthen its on-page presence (the keyword-phrase chip row in `ServiceHero.tsx`, an FAQ entry, a `ServiceValueProps` description) rather than creating a duplicate page — this codebase deliberately avoids one-page-per-keyword-variant to prevent cannibalization (see `SEO_KEYWORD_MAP.md`'s cannibalization note on `/locations/bandung`).
3. If it's a genuinely new intent, add it to `SEO_KEYWORD_MAP.md` first (classify Ready to Buy / Compare / Research) before deciding whether it warrants new content — do not add pages ad hoc outside that framework.

## What this sprint did NOT set up

Stated plainly, matching the "Pending is not fake" convention in `docs/analytics/KPI_DEFINITIONS.md`:

- No Search Console property is actually verified yet — this is a playbook for a human to execute, not evidence one exists.
- No Search Console API / Google Cloud service account is wired into the codebase — GA4 Data API integration is also still "Pending" per Sprint W9-1's own KPI doc, and Search Console follows the same pattern.
- The `localtailor.id` vs. Vercel-URL canonical-domain decision above is unresolved and blocks doing this for real — flagging it here is this sprint's contribution, not a fix.
