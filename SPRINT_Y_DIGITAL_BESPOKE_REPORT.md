# Sprint Y — Digital Bespoke Tailoring Experience — Implementation Report

## Executive Summary

Built the Digital Bespoke Tailoring positioning as a pillar page merged onto the existing, live `/design-studio` configurator — a decision made explicitly with the user before any code was touched, since the brief's original ask ("landing page utama: /design-studio" + "jangan redesign" + "pertahankan navigation") contradicted itself against the fact that `/design-studio` is a real, revenue-critical product page (the actual bespoke order-building tool), not an empty route. The resolution: marketing pillar content (Hero → Booking CTA) now sits above the untouched configurator, which renders further down the same page in its own `<section id="the-studio">`. "Explore Design Studio" scrolls to it. **Zero changes to `DesignStudioClient`, `ConfiguratorPanel`, the Zustand store, or the estimate/save flow** — verified visually via a local production build + screenshot (configurator renders pixel-identical to before).

Alongside the page, a full 15-article Digital Bespoke Tailoring content cluster was built under a new `design-studio` Knowledge category — 1 cornerstone + 14 supporting articles across 4 sub-clusters, all cross-linked, all funneling to `/design-studio` automatically via the existing `KnowledgeCTAGroup` architecture (a new CTA config entry, not new markup).

## Files Created

**Knowledge cluster:**
- `src/lib/knowledge/articles/designStudio.ts` — 15 articles (cornerstone + 4 sub-clusters)

**Pillar page components** (`src/components/design-studio/`):
- `DigitalBespokeHero.tsx`, `WhatIsDesignStudio.tsx`, `ExperienceCards.tsx`, `ProcessTimeline.tsx`, `ProblemSolutionTable.tsx`, `BookingCTA.tsx`

**Homepage integration:**
- `src/components/marketing/sections/DesignStudioPreview.tsx`
- `src/lib/design-studio/experienceCopy.ts` — shared `DIGITAL_BESPOKE_EXPERIENCES` data (homepage and `/design-studio` render the exact same 3 cards, never two copies that could drift)

## Files Changed

- `src/app/design-studio/page.tsx` — full restructure: pillar content merged above the untouched `DesignStudioClient`; new metadata (exact Y-4 copy); Service/FAQPage/BreadcrumbList/Organization/LocalBusiness/WebSite/HowTo schema
- `src/components/marketing/HomePage.tsx` — added `DesignStudioPreview` section (dynamically imported, same pattern as every other below-the-fold section)
- `src/lib/knowledge/types.ts` — added `'design-studio'` to `KnowledgeCategorySlug`
- `src/lib/knowledge/categories.ts` — added the `design-studio` category hub entry
- `src/lib/knowledge/cta.ts` — added `design-studio` CTA config (`showEstimatePrice: true`, which is the existing `CTAEstimatePrice` component already linking to `/design-studio` — this is *how* every cluster article automatically leads back to `/design-studio` without new markup)
- `src/lib/knowledge/articles/index.ts` — registered `DESIGN_STUDIO_ARTICLES`
- `src/lib/editorial/queryIntent.ts` — added the required `design-studio` entry (`BOFU`/`commercial`) to the exhaustive `CATEGORY_INTENT_PROFILE` record (TypeScript caught this as a compile error — good, exactly the kind of gap an exhaustive type should catch)
- `src/lib/seo/entities.ts` — added 5 new secondary entities: Digital Bespoke Tailoring, Design Studio, Video Call Fitting, Home Visit Tailor, Custom Thobe Online
- `SEO_KNOWLEDGE_GRAPH.md` — documented the 5 new entities and the new content cluster
- `scripts/seo-validate.ts` — unaffected functionally; re-verified against the larger route set

## Pages Created

- `/knowledge/design-studio` (hub, auto-rendered by the existing `[category]/page.tsx`)
- `/knowledge/design-studio/bespoke-tanpa-harus-datang-ke-bandung` (cornerstone)
- 14 supporting articles under `/knowledge/design-studio/*` (see cluster coverage table below)

## Components Created

| Component | Purpose | Reusability |
|---|---|---|
| `DigitalBespokeHero` | Hero (h1, 2 CTA, visual) | Page-specific |
| `WhatIsDesignStudio` | "Apa itu Design Studio?" | Page-specific |
| `ExperienceCards` | 3-card grid (Video Call / Home Visit / Showroom) | Generic — reused verbatim on homepage |
| `ProcessTimeline` | Customer Journey timeline | Generic props (`steps: {title, description}[]`) |
| `ProblemSolutionTable` | Keunggulan comparison table | Generic props (`rows: {problem, solution}[]`) |
| `BookingCTA` | Closing booking section | Generic props |
| `FaqSection` (reused, not recreated) | FAQ | Already existed from Sprint W7 |

## Schema Coverage (`/design-studio`, verified live)

| Schema | Detail |
|---|---|
| `Service` | `name: "Digital Bespoke Tailoring"`, `provider: Local Tailor` — verified in rendered HTML |
| `FAQPage` | 8 questions (brief's minimum) — verified count |
| `BreadcrumbList` | Home → Design Studio |
| `Organization` | Reused W7's `organizationSchema()` |
| `LocalBusiness` | Reused W7's `localBusinessSchema()` |
| `WebSite` | Reused W7's `websiteSchema()` |
| `HowTo` | Customer Journey (Book Session → Video Call → Design Studio → Approve Design → Production → Delivery), 6 `HowToStep`s |

## SEO Cluster Coverage

| Sub-cluster | Articles | Status |
|---|---|---|
| Cornerstone | Bespoke Tailoring Tanpa Harus Datang ke Bandung | ✅ (10 FAQ, comparison table, HowTo-shaped steps) |
| Custom Thobe Online | 5/5 (Cara Pesan Luar Kota, Jahit Tanpa Datang, Panduan Lengkap, Bespoke dari Rumah, Cara Ukur Sendiri) | ✅ |
| Video Call Fitting | 3/3 (Apakah Akurat, Pengalaman, Konsultasi Gratis) | ✅ |
| Home Visit | 3/3 (Layanan Bandung, Tailor ke Rumah, Wedding & Keluarga) | ✅ |
| Design Studio | 3/3 (Apa Itu, Cara Mendesain, Kenapa Mulai dari Desain) | ✅ |

**Total: 15/15 articles**, every one carrying `definition` + `quickAnswer` + `keyTakeaways` (Key Benefits) + structured `sections` (steps/lists/tables where the content calls for it) + `faq` + `relatedArticles` — the Y-6 AI-friendly shape, using the Knowledge Engine's existing schema rather than inventing a new one.

## Internal Linking Summary

- **Cluster → Cluster**: every article's `relatedArticles` links to 2-4 siblings, verified live on the cornerstone (5 outbound cross-links confirmed in rendered HTML)
- **Cluster → `/design-studio`**: automatic via `KnowledgeCTAGroup`'s `design-studio` CTA config (`CTAEstimatePrice` → `/design-studio`) on all 15 article pages — no per-article manual linking needed, verified live
- **Cluster → other Knowledge categories**: `measurements`, `tailoring`, `wedding`, `fabrics` cross-links where genuinely relevant (e.g. `cara-ukur-badan-sendiri-untuk-thobe` → `measurements/how-to-measure-body`)
- **Homepage → `/design-studio`**: new `DesignStudioPreview` section (`#digital-bespoke-tailoring`), reusing the exact same `ExperienceCards` + data as the pillar page
- **Nav / mobile nav → `/design-studio`**: already existed since the project's first sprint — verified both desktop and mobile drawer render from the same `navCopy.links` array

## Build Status

`npm run build` — **green**. Route count confirms both additions: `/knowledge/[category]` now covers 10 categories (was 9), `/knowledge/[category]/[slug]` now covers +98 paths (was +83 — exactly +15).

## Lint Status

`npm run lint` — **green** (one pre-existing warning, unrelated).

## Typecheck Status

`npx tsc --noEmit` — clean. Caught one real gap along the way: `src/lib/editorial/queryIntent.ts`'s exhaustive `Record<KnowledgeCategorySlug, ...>` required a `design-studio` entry before the build would pass — fixed as part of this sprint, not deferred.

## SEO Validation Status

`npm run seo:validate` — all checks passed, including `/design-studio`'s metadata/heading audit.

## Production Verification (local build)

- `/design-studio`, `/knowledge/design-studio`, `/knowledge/design-studio/bespoke-tanpa-harus-datang-ke-bandung` all HTTP 200
- Title: exact Y-4 copy (`Design Studio — Bespoke Tailoring Tanpa Batas Jarak | Local Tailor`)
- Canonical: `https://ltos-local-tailor.vercel.app/design-studio`
- Service schema: `name: "Digital Bespoke Tailoring"`, `provider: LocalBusiness "Local Tailor"` — confirmed in rendered HTML
- FAQ count: 8 `Question` entities — confirmed
- Sitemap: `/design-studio` in `sitemap-pages.xml`; 16 entries (`1` hub `+ 15` articles) in `sitemap-knowledge.xml`
- Homepage: `DesignStudioPreview` section renders the exact Y-positioning copy and correct `/design-studio` links
- **Visual screenshot verification** (Chrome DevTools, 1440×900): Hero renders correctly matching the design system; scrolled to `#the-studio` and confirmed the actual configurator (fabric/collar/cuff thumbnails, 3D preview, price panel) renders **pixel-identical** to its pre-Sprint-Y state — no layout break from the merge. Only console message was a pre-existing, unrelated `favicon.ico` 404.

## Deployment

Not yet deployed — build/lint verified green per this report; awaiting the same commit/push/deploy go-ahead pattern as prior sprints. Note: **Sprint W8-B** (Local SEO Infrastructure + Appointment & Review Engine, including the pre-deploy domain audit fix) was also fully verified and ready but never pushed — it will be committed as its own separate commit alongside this one, in the same push, since both are complete and this sprint's own instructions call for push + deploy now.

## Suggested Commit Messages

```
feat(seo): W8-B local SEO infrastructure + appointment & review engine

[as previously drafted — see SPRINT_W8_B_LOCAL_SEO_INFRA_APPOINTMENT_REVIEW_REPORT.md
for full detail. Includes the pre-deploy domain audit fix: CITY_BUSINESS.website
now points at the canonical ltos-local-tailor.vercel.app instead of localtailor.id.]

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

```
feat(marketing): Sprint Y Digital Bespoke Tailoring experience

Merges a new marketing pillar (Hero, Apa itu Design Studio, 3-card
Video Call/Home Visit/Showroom experience, Customer Journey timeline,
Problem/Solution comparison, 8-item FAQ, Booking CTA) onto the
existing, live /design-studio configurator — the tool itself
(DesignStudioClient, ConfiguratorPanel, Zustand store, estimate/save
flow) is completely untouched, rendered further down the same page in
its own section. Full schema: Service ("Digital Bespoke Tailoring"),
FAQPage, BreadcrumbList, Organization, LocalBusiness, WebSite, HowTo.

New 15-article Knowledge cluster under design-studio (cornerstone +
Custom Thobe Online/Video Call Fitting/Home Visit/Design Studio
sub-clusters), all cross-linked and all funneling to /design-studio
via a new KnowledgeCTAGroup CTA config — no per-article manual links
needed, reusing the existing Knowledge Engine architecture exactly.

Homepage gets a new DesignStudioPreview section sharing the exact same
3-card data as the pillar page. 5 new entities registered
(Digital Bespoke Tailoring, Design Studio, Video Call Fitting, Home
Visit Tailor, Custom Thobe Online).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

Ready to commit, push, and deploy — awaiting your go-ahead.
