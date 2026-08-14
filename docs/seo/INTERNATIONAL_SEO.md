# International SEO — Sprint W11.5

Internationalization & Global SEO layer added on top of the W1–W10 baseline. Reads this doc alongside `docs/design-language/` and the existing `src/lib/seo/` utilities — it doesn't replace them.

## 1. Locale architecture

**Scope: the public marketing/SEO surface only.** Locale routing lives at `src/app/[locale]/` and covers home, Knowledge, Fabric Explorer, Locations, Gallery, Journal, Design Studio (public preview), the 5 Revenue Landing Pages, Book Appointment, Contact, the free body-profile estimator, and the 4 size-guide content pages.

The authenticated operational app — `/owner`, `/command-center`, `/workspace`, `/fitter`, `/inventory` — and the QR-token **Production Flow** (`/production/*`) and customer-token **Customer Journey** (`/journey/*`) stay **outside** locale routing, unprefixed, exactly as before. Their URLs are load-bearing for `src/middleware.ts`'s role-gated auth rules and for kiosk/QR/customer-token links already in circulation; putting them under `/[locale]/` would have broken all of that. `/login` and `/access-denied` are excluded for the same reason.

- **Locales**: `id` (default, unprefixed), `en`, `ar`, `fr`, `ja`, `de` — `src/i18n/config.ts`.
- **Routing**: [next-intl](https://next-intl.dev) v3, `localePrefix: 'as-needed'` — `src/i18n/routing.ts`. `id` serves at `/`, `/fabric`, etc. (identical to pre-i18n URLs); every other locale gets a prefix (`/en/fabric`, `/ar/fabric`, ...).
- **Detection**: `src/middleware.ts` runs the existing role-gated auth logic first (unchanged), then next-intl's middleware for everything else — Accept-Language header → `NEXT_LOCALE` cookie (1 year) → path prefix, in that priority order. Once a visitor has a `NEXT_LOCALE` cookie, it wins over Accept-Language so they never get redirect-looped back to their browser language after manually switching.
- **`<html lang>` / `dir`**: set once, in the single root `src/app/layout.tsx` (Next.js allows exactly one `<html>` across the whole app), via next-intl's `getLocale()` — which resolves correctly for both the locale-routed public site and the unlocalized auth app (falls back to `id` there, matching the previous hardcoded `lang="id"`).

## 2. Translation workflow

Message catalogs live in `messages/{locale}.json`, one flat set of namespaces: `nav`, `hero`, `cta`, `designStudio`, `booking`, `contact`, `faq`, `trust`, `footer`, `languageSwitcher`. This is the sprint's "minimal cover" scope (chrome + conversion layer), not full page-body transcreation — see §6 for exactly what's translated where.

- Read a string: `useTranslations('namespace')` in a client component, `getTranslations('namespace')` (from `next-intl/server`) in a server component.
- Add a key: add it to **every** `messages/*.json` file, same nesting, same key name. There's no fallback-to-English for a missing key in a non-default locale — next-intl throws in dev, renders the raw key in prod. Keep the 6 files in lockstep.
- Interpolation: `{year}`-style placeholders, e.g. `footer.legal` → `t('legal', { year: 2026 })`.

## 3. Adding a new language

1. Add the locale code to `locales` in `src/i18n/config.ts`, plus its `localeToHreflang` (BCP-47) and `localeLabels` (native + English display name) entries. Add it to `rtlLocales` too if it's RTL.
2. Create `messages/{locale}.json` with every key that exists in `messages/en.json` — same shape.
3. If the language is one of the 5 Revenue Landing Pages' translated locales, add a `translations.{locale}` entry to the relevant `SERVICE_CONFIGS` items in `src/lib/seo/serviceConfig.ts` (see §6 — today only `en`/`ar` exist there).
4. Nothing else changes — routing (`src/i18n/routing.ts`), the language switcher (`LanguageSwitcher.tsx`, reads `locales` directly), hreflang (`src/i18n/alternates.ts`), and the sitemap (`src/lib/sitemap/build.ts`) all derive from `src/i18n/config.ts` and pick the new locale up automatically.

## 4. hreflang strategy

Every localized route's `generateMetadata()` runs its existing metadata builder's output through `withLocaleAlternates()` (`src/i18n/alternates.ts`), which is invoked at the **page** level (not inside the ~15 shared builders like `buildFabricMetadata`/`buildServiceMetadata`/`buildKnowledgeArticleMetadata` — those, and their non-i18n callers, are untouched). It sets:

- `alternates.canonical` — the current locale's own URL for that path.
- `alternates.languages` — one entry per locale (`id-ID`, `en-US`, `ar`, `fr-FR`, `ja-JP`, `de-DE`) plus `x-default`, which points at the unprefixed `id` URL (the real default, not a synthetic redirect target).

The sitemap (`src/lib/sitemap/build.ts`) independently emits the same alternates as `<xhtml:link rel="alternate" hreflang="...">` entries on every `<url>` block (Google's multilingual sitemap extension), so hreflang is discoverable from both the page `<head>` and the sitemap.

Known gap: `src/app/[locale]/design/[slug]` (dynamic, session-encoded design-share links, not a crawlable catalog page — see its own file comment on why it stays fully dynamic) does not get hreflang wiring; it was judged out of scope as a non-indexed, per-visitor share URL rather than an SEO landing page.

## 5. Global keyword strategy

- **Indonesian** stays the primary-market language across the whole content library (Knowledge, Fabric Explorer, homepage long-form sections) — untouched by this sprint.
- **English** targets the same commercial intent as the Indonesian revenue pages but in natural English search phrasing ("Bespoke Tailor Bandung", "Premium Tailor in Bandung", "Custom Thobe Tailoring", "Umrah Tailor Bandung") — see `keywordPrimary`/`keywordSecondary`/`hero.keywordPhrases` under each service's `translations.en` in `src/lib/seo/serviceConfig.ts`.
- **Arabic** targets the Umrah/Gulf-traveler and diaspora search intent with real Arabic phrasing (خياط بيسبوك باندونغ، خياط ملابس عمرة باندونغ، إلخ), not a transliteration of the English keywords.

## 6. What's translated where (exact scope)

| Surface | id | en | ar | fr | ja | de |
|---|---|---|---|---|---|---|
| Nav, Footer, global CTA labels, FAQ/Trust headings, Design Studio preview, Booking, Contact | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Homepage Hero (`Hero.tsx`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 Revenue Landing Pages — hero, value props, FAQ, WhatsApp CTA (`serviceConfig.ts` `translations`) | ✅ | ✅ | ✅ | — | — | — |
| Homepage long-form sections (Craftsmanship, Workshop, Authority, Reviews, Trust Badges, ...), Knowledge articles, Fabric Explorer body copy, Locations pages | ✅ | — | — | — | — | — |

Every locale still gets correct routing, hreflang, canonical, JSON-LD `inLanguage`/`availableLanguage`, and sitemap coverage even where body copy isn't yet translated — those visitors see the real page in Indonesian with fully correct international-SEO signaling, not a broken or missing page. Extending body-copy translation further is additive: add message keys / `serviceConfig.ts` translations, no architecture change needed.

## 7. Arabic SEO considerations

- `dir="rtl"` is set on `<html>` (root layout, via `isRtlLocale()`) whenever the resolved locale is `ar`, and again on the Revenue Landing Page's own wrapper for defense-in-depth.
- RTL support in this sprint is **functional, not exhaustively pixel-audited**: correct text direction and correct reading order for the site's flex/grid-based layouts (which mirror automatically under `dir="rtl"` per the CSS flexbox/grid spec — no logical Tailwind utilities were required for Nav/Footer/Revenue Landing Page). Components using physical spacing utilities (`ml-`, `pl-`, `text-left`) elsewhere in the marketing component tree were not individually audited for RTL polish — flagged here as a follow-up, not silently claimed as done.
- Arabic keyword/copy is native Arabic phrasing throughout, not transliterated or machine-translated Latin-script Arabic.

## 8. English SEO considerations

- English titles/descriptions follow the same `| Local Tailor` brand-suffix convention as the Indonesian originals (`buildServiceMetadata`, unchanged).
- `hreflang="en-US"` — chosen over a bare `en` since the brief's own worked example specified it; revisit if UK/international English search behavior diverges enough to warrant a second `en-GB`/`en` split later.

## 9. Deployment checklist

- [ ] `npm run build` and `npm run lint` green (see Sprint report for this run's result).
- [ ] Spot-check `/`, `/en`, `/ar`, `/fr`, `/ja`, `/de` render and the language switcher round-trips correctly (switch → cookie persists → no redirect loop on reload).
- [ ] Spot-check one auth-gated route (`/owner/login`) still requires login and was never locale-prefixed.
- [ ] Verify `/sitemap-pages.xml` and `/sitemap-knowledge.xml` contain the `xhtml:link` alternates and that entry counts are ~6x their pre-sprint size (one entry per locale per page).
- [ ] Submit the updated sitemap in Google Search Console; add `hreflang` verification via GSC's International Targeting report once it has crawled the new locale URLs.
- [ ] `FABRIC_SITE_ORIGIN` / `CITY_SITE_ORIGIN` (`src/lib/materials/seo.ts`) is `https://ltos-local-tailor.vercel.app` — **not** `https://localtailor.id`. `src/lib/seo/serviceBusinessSchema.ts`'s own comment documents `localtailor.id` as a separate, unrelated WordPress site as of this sprint. All hreflang/canonical/sitemap URLs in this sprint point at the real Vercel origin to avoid pointing hreflang at a domain this app doesn't serve. If `localtailor.id` has since become this app's real production domain, update that one constant — every URL in this sprint (metadata, sitemap, schema) derives from it, so nothing else needs to change.
