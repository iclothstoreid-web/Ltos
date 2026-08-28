import type { SupabaseClient } from '@supabase/supabase-js'
import { getAllMaterials } from '@/lib/materials/materialRepository'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { FABRIC_CATEGORIES } from '@/types/material'
import { ALL_ARTICLES } from '@/lib/content/articles'
import { KNOWLEDGE_CATEGORIES } from '@/lib/knowledge/categories'
import { ALL_KNOWLEDGE_ARTICLES } from '@/lib/knowledge/articles'
import { fabricPhotos, garmentPhotos, measurementMannequinSrc } from '@/lib/marketing/assets'
import { CITY_CONFIGS } from '@/lib/seo/cityConfig'
import { SERVICE_CONFIGS } from '@/lib/seo/serviceConfig'
import { NATIONAL_CONFIGS } from '@/lib/seo/nationalConfig'
import { locales, localeToHreflang } from '@/i18n/config'
import { pathForLocale } from '@/i18n/alternates'

// Sprint W6-8 — sitemap split. Previously one src/app/sitemap.ts covered
// every route; now that /knowledge alone is 34 routes (soon 66), one flat
// file made the marketing/knowledge split hard to reason about and hard to
// resubmit independently in Search Console. This module is the single
// source of entries; the 3 sitemap-*.xml routes and the sitemap.xml index
// all read from here so the URL list can never drift between them.

export interface SitemapUrlEntry {
  url: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  /** hreflang -> absolute URL, including "x-default". Sprint W11.5 — every
   * entry below now goes through localizedEntries(), which fills this in. */
  alternates?: Record<string, string>
}

// Sprint W11.5 Task 6 — every static/knowledge/material page moved under
// src/app/[locale]/ now gets one <url> entry per locale (id unprefixed, the
// other 5 "/{locale}"-prefixed, matching src/i18n/routing.ts's
// localePrefix: 'as-needed'), each carrying the full xhtml:link alternate
// set so crawlers get hreflang from the sitemap itself, not only the
// per-page <head> tags withLocaleAlternates() already emits.
function localizedEntries(
  path: string,
  changeFrequency: SitemapUrlEntry['changeFrequency'],
  priority: number
): SitemapUrlEntry[] {
  const alternates: Record<string, string> = { 'x-default': `${FABRIC_SITE_ORIGIN}${path}` }
  for (const locale of locales) {
    alternates[localeToHreflang[locale]] = `${FABRIC_SITE_ORIGIN}${pathForLocale(path, locale)}`
  }
  return locales.map((locale) => ({
    url: `${FABRIC_SITE_ORIGIN}${pathForLocale(path, locale)}`,
    changeFrequency,
    priority,
    alternates,
  }))
}

export interface SitemapImageEntry {
  pageUrl: string
  imageUrl: string
  caption: string
}

// Everything that isn't /knowledge/* — homepage, Fabric Explorer + its
// materials, the estimator, the W0.5 content cluster, and the 3 nav
// placeholder pages. Mirrors the pre-split sitemap.ts's staticEntries +
// materialEntries exactly, so no page that was indexed before this split
// silently drops out of it.
export async function buildPagesSitemapEntries(supabase: SupabaseClient): Promise<SitemapUrlEntry[]> {
  const materials = await getAllMaterials(supabase)

  const staticEntries: SitemapUrlEntry[] = [
    ...localizedEntries('/', 'weekly', 1),
    ...localizedEntries('/design-studio', 'weekly', 0.9),
    ...localizedEntries('/fabric', 'daily', 0.9),
    ...FABRIC_CATEGORIES.flatMap((category) => localizedEntries(`/fabric/${category}`, 'daily', 0.8)),
    ...localizedEntries('/free-body-profile-estimator', 'weekly', 0.9),
    ...ALL_ARTICLES.flatMap((article) => localizedEntries(`/${article.slug}`, 'monthly', 0.7)),
    ...localizedEntries('/book-appointment', 'monthly', 0.8),
    ...localizedEntries('/gallery', 'monthly', 0.5),
    ...localizedEntries('/journal', 'monthly', 0.5),
    // Sprint W8-1 — Location SEO Foundation, migrated to cityConfig.ts in W8-2/3.
    ...localizedEntries('/locations', 'monthly', 0.8),
    ...CITY_CONFIGS.flatMap((city) => localizedEntries(`/locations/${city.slug}`, 'monthly', 0.7)),
    // Sprint W8-B — Local Citation Infrastructure.
    ...localizedEntries('/contact', 'monthly', 0.6),
    // Sprint W10 — Organic Acquisition Engine, the 5 commercial-intent
    // Revenue Landing Pages. Priority 0.85: below the core nav pages
    // (design-studio/fabric at 0.9) but above the geographic /locations
    // pages (0.7), reflecting these are the highest-purchase-intent pages
    // in the site.
    ...SERVICE_CONFIGS.flatMap((service) => localizedEntries(`/${service.slug}`, 'weekly', 0.85)),
    // National SEO (P0) — the two Indonesia-wide commercial pillars sit one
    // step above the Bandung Revenue Landing Pages in the funnel (national
    // -> local -> geo), so priority 0.9, level with design-studio/fabric.
    ...NATIONAL_CONFIGS.flatMap((national) => localizedEntries(`/${national.slug}`, 'weekly', 0.9)),
  ]

  const materialEntries: SitemapUrlEntry[] = materials.flatMap((material) =>
    localizedEntries(`/fabric/${material.category}/${material.slug}`, 'weekly', 0.7)
  )

  return [...staticEntries, ...materialEntries]
}

// Every /knowledge route — landing, all 7 hubs (live and foundation
// alike), and every article. New articles need zero sitemap change: this
// iterates ALL_KNOWLEDGE_ARTICLES / KNOWLEDGE_CATEGORIES directly.
export function buildKnowledgeSitemapEntries(): SitemapUrlEntry[] {
  return [
    ...localizedEntries('/knowledge', 'weekly', 0.9),
    ...KNOWLEDGE_CATEGORIES.flatMap((category) => localizedEntries(`/knowledge/${category.slug}`, 'weekly', 0.8)),
    ...ALL_KNOWLEDGE_ARTICLES.flatMap((article) => localizedEntries(`/knowledge/${article.category}/${article.slug}`, 'monthly', 0.7)),
  ]
}

// Real image sitemap — homepage's real Supabase photography (fabric
// macro shots, garment editorial photos) plus every published material's
// hero_image. Deliberately does NOT include any /knowledge page: zero
// Knowledge articles have real photography yet (same "no real photography
// exists for these guide pages" situation the W0.5 cluster documented),
// and an image sitemap entry asserts a real image exists at that page —
// fabricating one here would misrepresent Knowledge pages as having
// photography they don't.
export async function buildImagesSitemapEntries(supabase: SupabaseClient): Promise<SitemapImageEntry[]> {
  const materials = await getAllMaterials(supabase)
  const homepageUrl = FABRIC_SITE_ORIGIN

  const homepageImages: SitemapImageEntry[] = [
    { pageUrl: homepageUrl, imageUrl: fabricPhotos.woolBlendTwill, caption: 'Wool blend twill fabric macro detail' },
    { pageUrl: homepageUrl, imageUrl: fabricPhotos.egyptianCotton, caption: 'Egyptian cotton fabric macro detail' },
    { pageUrl: homepageUrl, imageUrl: fabricPhotos.linenWeave, caption: 'Linen weave fabric macro detail' },
    { pageUrl: homepageUrl, imageUrl: fabricPhotos.silkCottonBlend, caption: 'Silk cotton blend fabric macro detail' },
    { pageUrl: homepageUrl, imageUrl: garmentPhotos.blackPinstripe, caption: 'Bespoke thobe, black pinstripe' },
    { pageUrl: homepageUrl, imageUrl: garmentPhotos.navy, caption: 'Bespoke thobe, navy' },
    { pageUrl: homepageUrl, imageUrl: garmentPhotos.maroonPiping, caption: 'Bespoke thobe look cutting, maroon piping' },
    { pageUrl: `${homepageUrl}/design-studio`, imageUrl: `${homepageUrl}${measurementMannequinSrc}`, caption: 'Design Studio fitting mannequin' },
  ]

  const materialImages: SitemapImageEntry[] = materials
    .filter((material) => !!material.hero_image)
    .map((material) => ({
      pageUrl: `${homepageUrl}/fabric/${material.category}/${material.slug}`,
      imageUrl: material.hero_image as string,
      caption: `${material.name} fabric`,
    }))

  return [...homepageImages, ...materialImages]
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export function serializeUrlSitemap(entries: SitemapUrlEntry[]): string {
  const urls = entries
    .map((entry) => {
      const alternateLinks = entry.alternates
        ? Object.entries(entry.alternates)
            .map(([hreflang, href]) => `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`)
            .join('\n') + '\n'
        : ''
      return `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n${alternateLinks}    <changefreq>${entry.changeFrequency}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
    })
    .join('\n')
  // xmlns:xhtml — Google's multilingual sitemap extension for hreflang
  // (https://developers.google.com/search/docs/specialty/international/localized-versions#sitemap).
  // Every entry above now carries `alternates` (see localizedEntries()), so
  // this covers every localized route the sitemap lists.
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`
}

// Google's image sitemap extension — one <url> per page, each carrying one
// or more <image:image> children. Entries sharing a pageUrl are grouped so
// a page with multiple real images (the homepage) emits one <url> block,
// not one per image.
export function serializeImageSitemap(entries: SitemapImageEntry[]): string {
  const byPage = new Map<string, SitemapImageEntry[]>()
  for (const entry of entries) {
    const existing = byPage.get(entry.pageUrl) ?? []
    existing.push(entry)
    byPage.set(entry.pageUrl, existing)
  }

  const urls = Array.from(byPage.entries())
    .map(([pageUrl, images]) => {
      const imageTags = images
        .map((image) => `    <image:image>\n      <image:loc>${escapeXml(image.imageUrl)}</image:loc>\n      <image:caption>${escapeXml(image.caption)}</image:caption>\n    </image:image>`)
        .join('\n')
      return `  <url>\n    <loc>${escapeXml(pageUrl)}</loc>\n${imageTags}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>`
}

export function serializeSitemapIndex(sitemapUrls: string[]): string {
  const entries = sitemapUrls.map((url) => `  <sitemap>\n    <loc>${escapeXml(url)}</loc>\n  </sitemap>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`
}
