# SEO / AI Discoverability Validation Checklist

Sprint W7 — AI SEO & Structured Data Layer. Run `npm run seo:validate` before every deploy that touches marketing routes or `src/lib/seo/*`; it is a static-analysis check, not a live crawler (no network calls, no OpenAI usage).

## Automated (covered by `npm run seo:validate`)

- [ ] Every generic schema builder in `src/lib/seo/schema.ts` returns the required `@context`/`@type` fields and type-specific required fields (offers on Product, provider on Service, step on HowTo, etc.)
- [ ] `faqSchema([])` returns `null` (never emits an empty `FAQPage`)
- [ ] Every public `page.tsx` (excluding staff/internal routes per `robots.ts`, and the customer-token `/journey/*` flow) exports `metadata` or `generateMetadata`
- [ ] No public `page.tsx` source contains more than one `<h1>`

## Manual — Schema Validation

- [ ] Paste each page's rendered JSON-LD into [Google Rich Results Test](https://search.google.com/test/rich-results) and confirm no errors (warnings for optional fields like `aggregateRating`/`price` are expected and intentional — see report)
- [ ] Confirm `Organization`, `LocalBusiness`, and `WebSite` schema all resolve to the same canonical `url` (`https://ltos-local-tailor.vercel.app`)
- [ ] Confirm every `BreadcrumbList` schema's item URLs match the page's own visible breadcrumb nav exactly (name + href)
- [ ] Confirm every `FAQPage` schema's questions match the visible FAQ copy on the same page verbatim

## Manual — Metadata Audit

- [ ] Every page's `<title>` is unique across the site (no two routes share a title)
- [ ] Every page's meta description is unique and under ~160 characters
- [ ] Every public page has a `canonical` link pointing at itself (not another page, not a query-parameterized variant)
- [ ] `openGraph.type` is `'article'` for content pages, `'website'` for everything else
- [ ] `robots: { index: true, follow: true }` is present on every page meant to be indexed

## Manual — Heading / Semantic HTML Audit

- [ ] Exactly one `<h1>` per rendered page (including h1s rendered by child components, which the automated check cannot see)
- [ ] Heading levels never skip (no `<h2>` directly followed by `<h4>`)
- [ ] Each page has exactly one `<main>` landmark
- [ ] Primary content is wrapped in `<article>` where the page represents a single piece of content (Knowledge articles, W0.5 guides)

## Manual — AI Discoverability Spot-Check

- [ ] Ask ChatGPT/Claude/Gemini/Perplexity "custom thobe Bandung" or "bespoke thobe tailor Indonesia" and note whether Local Tailor's content is cited (baseline for future comparison — not expected to change overnight)
- [ ] Confirm `sitemap.xml` (and its 3 sub-sitemaps) are reachable and list every new route added this sprint
- [ ] Confirm `robots.txt` still allows crawling of all public marketing routes

## Known, Deliberate Gaps (do not "fix" these without new real data)

- No `sameAs` social profile URLs on Organization/Person schema — no Instagram/Facebook/TikTok presence exists yet in this codebase
- No `logo` on Organization schema — no deployed logo asset exists
- No `SearchAction` on WebSite schema — no site-wide search endpoint exists
- No `aggregateRating` on Product schema — no real review data exists
- No fixed `price` on Product/Offer schema — every garment is made-to-order and quoted per consultation (see `src/lib/materials/seo.ts`'s own documented reasoning)

Fabricating any of the above to pass a schema validator would be a false authority/rich-result signal, not a real SEO improvement — see `SPRINT_W7_AI_SEO_REPORT.md` for the full reasoning.
