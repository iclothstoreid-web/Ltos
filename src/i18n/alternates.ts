import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { locales, defaultLocale, localeToHreflang, type AppLocale } from './config'

// Sprint W11.5 Task 5 — hreflang + locale-aware canonical, applied at the
// topmost page-level generateMetadata() for every localized route rather
// than inside each of the many existing shared metadata builders
// (buildFabricMetadata, buildSimplePageMetadata, buildServiceMetadata,
// buildKnowledgeArticleMetadata, ...) — those builders, their other
// (non-i18n) call sites, and their own comments/tests stay untouched.
// `path` is the canonical UNPREFIXED path (e.g. "/fabric/wool-blend-twill",
// exactly what those builders already compute their `url` from) — id (the
// default locale) resolves to that path with no prefix, every other locale
// gets a "/{locale}" prefix, matching src/i18n/routing.ts's
// localePrefix: 'as-needed'.
export function pathForLocale(path: string, locale: AppLocale): string {
  return locale === defaultLocale ? path : `/${locale}${path}`
}

export async function withLocaleAlternates(metadata: Metadata, origin: string, path: string): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale
  const languages: Record<string, string> = {}
  for (const l of locales) {
    languages[localeToHreflang[l]] = `${origin}${pathForLocale(path, l)}`
  }
  // x-default points at the unprefixed (id) URL — same page id already
  // serves at "/", so unmatched-locale traffic lands on the real default
  // rather than a synthetic redirect target.
  languages['x-default'] = `${origin}${path}`

  return {
    ...metadata,
    openGraph: metadata.openGraph
      ? { ...metadata.openGraph, url: `${origin}${pathForLocale(path, locale)}`, locale: localeToHreflang[locale] }
      : metadata.openGraph,
    alternates: {
      ...metadata.alternates,
      canonical: `${origin}${pathForLocale(path, locale)}`,
      languages,
    },
  }
}
