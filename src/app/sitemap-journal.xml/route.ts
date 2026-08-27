import { createPublicClient } from '@/lib/supabase/public'
import { fetchPublishedJournalArticles } from '@/lib/content/journalArticles'
import { serializeUrlSitemap, type SitemapUrlEntry } from '@/lib/sitemap/build'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { locales, localeToHreflang } from '@/i18n/config'
import { pathForLocale } from '@/i18n/alternates'

// DB-backed Journal (Sprint DS-UX Scope B). Unlike the hardcoded
// /knowledge cluster (buildKnowledgeSitemapEntries), journal slugs come
// from the DB at request time, so this route fetches them itself.
// Published-only, revalidated hourly.
export const revalidate = 3600

function localized(path: string, priority: number): SitemapUrlEntry[] {
  const alternates: Record<string, string> = { 'x-default': `${FABRIC_SITE_ORIGIN}${path}` }
  for (const locale of locales) alternates[localeToHreflang[locale]] = `${FABRIC_SITE_ORIGIN}${pathForLocale(path, locale)}`
  return locales.map((locale) => ({
    url: `${FABRIC_SITE_ORIGIN}${pathForLocale(path, locale)}`,
    changeFrequency: 'monthly' as const,
    priority,
    alternates,
  }))
}

export async function GET() {
  const supabase = createPublicClient()
  const articles = await fetchPublishedJournalArticles(supabase).catch(() => [])

  const entries: SitemapUrlEntry[] = [
    ...localized('/journal', 0.8),
    ...articles.flatMap((a) => localized(`/journal/${a.slug}`, 0.7)),
  ]

  return new Response(serializeUrlSitemap(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
