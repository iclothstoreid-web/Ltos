# Local Tailor — Knowledge Graph & Entity Mapping

Sprint W7-10. Source of truth: `src/lib/seo/entities.ts`. This document is the human-readable map of that registry — if the two ever disagree, the code file is correct and this document is stale and should be regenerated from it.

## Why this exists

AI answer engines (Google AI Overview, ChatGPT, Gemini, Claude, Perplexity) build their own internal entity graphs from a site's content and structured data. They're more likely to cite a site as authoritative on a topic when:

1. The same named entities appear consistently across pages, schema, and visible copy (no drift between what the JSON-LD claims and what the page actually says)
2. Entities are explicitly linked to each other (internal links + `sameAs`/`about`/`mentions`-style relationships)
3. A primary entity ("who is this site *for*") is unambiguous

This document — plus the `Organization`/`LocalBusiness`/`Article`/`Product`/`Service` schema now emitted across the site — is Local Tailor's attempt to make that graph explicit rather than implicit.

## Primary Entity

**Local Tailor** (`LocalBusiness`) — a bespoke tailoring house in Bandung, Indonesia, specializing in custom thobe and premium Muslim menswear. Represented by `Organization` + `LocalBusiness` schema on the homepage (`src/components/marketing/HomePage.tsx`) and every Knowledge article page.

## Secondary Entities

| Entity | schema.org type | Primary page | Related pages |
|---|---|---|---|
| Bespoke Thobe | Service | `/design-studio` | `/knowledge/tailoring`, `/` |
| Custom Thobe | Product | `/design-studio` | `/fabric`, `/knowledge/measurements/thobe-size-guide` |
| Made-to-Measure Thobe | Service | `/cara-mengukur-thobe` | `/cek-ukuran-thobe`, `/knowledge/measurements/how-to-measure-body` |
| Premium Cotton Thobe | Product | `/fabric/cotton` | `/knowledge/fabrics/egyptian-cotton`, `/knowledge/fabrics/japanese-cotton`, `/knowledge/fabrics/premium-cotton` |
| Linen Thobe | Product | `/knowledge/fabrics/linen` | `/fabric` |
| Wedding Thobe | Product | `/knowledge/wedding` | `/design-studio`, `/book-appointment` |
| Umrah Thobe | Product | `/knowledge/umrah` | `/design-studio`, `/book-appointment` |
| Bandung Tailor | Place | `/` | `/book-appointment` |
| Thobe Measurement | Service | `/cara-mengukur-thobe` | `/cek-ukuran-thobe`, `/size-chart-thobe`, `/knowledge/measurements` |
| Islamic Menswear | Thing | `/` | `/knowledge`, `/knowledge/umrah`, `/knowledge/wedding` |
| Digital Bespoke Tailoring | Service | `/design-studio` | `/knowledge/design-studio/bespoke-tanpa-harus-datang-ke-bandung`, `/knowledge/design-studio` |
| Design Studio | Service | `/design-studio` | `/knowledge/design-studio/apa-itu-design-studio-local-tailor`, `/knowledge/design-studio/cara-mendesain-thobe-sebelum-dijahit` |
| Video Call Fitting | Service | `/design-studio` | `/knowledge/design-studio/fitting-video-call-apakah-akurat`, `/knowledge/design-studio/konsultasi-tailor-online-gratis` |
| Home Visit Tailor | Service | `/design-studio` | `/knowledge/design-studio/layanan-home-visit-bandung`, `/knowledge/design-studio/home-visit-wedding-keluarga` |
| Custom Thobe Online | Product | `/design-studio` | `/knowledge/design-studio/custom-thobe-online-panduan-lengkap`, `/knowledge/design-studio/cara-pesan-custom-thobe-luar-kota` |

Each row's `Related pages` is the internal linking a future editor should preserve (or extend) when touching those routes — cutting a link here quietly weakens the entity graph even if nothing "breaks."

**Sprint Y note**: Digital Bespoke Tailoring is this sprint's own "primary entity" for the `/design-studio` pillar page specifically, but it's registered here as a secondary entity rather than replacing the sitewide Primary Entity above (Local Tailor) — redefining the whole site's primary entity for one feature was out of this sprint's scope.

## Content clusters feeding the graph

These already existed before Sprint W7 and are the actual substance behind the entity table above — W7 did not create this content, it made the entity relationships between it explicit:

- **W0.5 sizing cluster** (`src/lib/content/`) — `/cek-ukuran-thobe`, `/ukuran-thobe-pria`, `/cara-mengukur-thobe`, `/size-chart-thobe`
- **Knowledge base** (`src/lib/knowledge/`) — 7 categories (`bandung`, `care`, `fabrics`, `measurements`, `questions`, `styling`, `tailoring`, `umrah`, `wedding`), each with multiple articles, each already carrying `Article` + `FAQPage` + (where applicable) `HowTo` schema
- **Fabric Explorer** (`src/lib/materials/`) — `/fabric` and its material detail pages, each with `Product` schema
- **Digital Bespoke Tailoring cluster** (`src/lib/knowledge/articles/designStudio.ts`, Sprint Y) — 1 cornerstone + 14 supporting articles under the `design-studio` Knowledge category, all cross-linked and all funneling to `/design-studio` via the shared `KnowledgeCTAGroup` config

## Deliberately absent relationships

- No `sameAs` links to social profiles — none exist for this business yet
- No cross-site entity links (e.g. Wikidata `sameAs`) — would require an established Wikidata entry, which doesn't exist for a business at this stage
- No `AggregateRating`/review-derived entity signals — no real review data exists

## Maintaining this graph

When adding a new marketing or Knowledge page:

1. Check the table above — does it represent one of these entities? Link to/from its primary page.
2. If it's a genuinely new entity, add a row here **and** to `SECONDARY_ENTITIES` in `src/lib/seo/entities.ts` — keep both in sync.
3. Reuse `src/lib/seo/schema.ts`'s generic builders (or the existing domain-specific ones in `marketing/materials/content/knowledge`'s own `seo.ts` files) rather than inventing a new one-off schema shape.
