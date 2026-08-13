import type { SupabaseClient } from '@supabase/supabase-js'
import { getAllMaterials } from '@/lib/materials/materialRepository'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { FABRIC_CATEGORIES } from '@/types/material'
import { ALL_ARTICLES } from '@/lib/content/articles'
import { KNOWLEDGE_CATEGORIES } from '@/lib/knowledge/categories'
import { ALL_KNOWLEDGE_ARTICLES } from '@/lib/knowledge/articles'
import { fabricPhotos, garmentPhotos, measurementMannequinSrc } from '@/lib/marketing/assets'
import { CITY_CONFIGS } from '@/lib/seo/cityConfig'

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
    { url: FABRIC_SITE_ORIGIN, changeFrequency: 'weekly', priority: 1 },
    { url: `${FABRIC_SITE_ORIGIN}/design-studio`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${FABRIC_SITE_ORIGIN}/fabric`, changeFrequency: 'daily', priority: 0.9 },
    ...FABRIC_CATEGORIES.map((category) => ({
      url: `${FABRIC_SITE_ORIGIN}/fabric/${category}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    { url: `${FABRIC_SITE_ORIGIN}/free-body-profile-estimator`, changeFrequency: 'weekly', priority: 0.9 },
    ...ALL_ARTICLES.map((article) => ({
      url: `${FABRIC_SITE_ORIGIN}/${article.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${FABRIC_SITE_ORIGIN}/book-appointment`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${FABRIC_SITE_ORIGIN}/gallery`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${FABRIC_SITE_ORIGIN}/journal`, changeFrequency: 'monthly', priority: 0.5 },
    // Sprint W8-1 — Location SEO Foundation, migrated to cityConfig.ts in W8-2/3.
    { url: `${FABRIC_SITE_ORIGIN}/locations`, changeFrequency: 'monthly', priority: 0.8 },
    ...CITY_CONFIGS.map((city) => ({
      url: `${FABRIC_SITE_ORIGIN}/locations/${city.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  const materialEntries: SitemapUrlEntry[] = materials.map((material) => ({
    url: `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...materialEntries]
}

// Every /knowledge route — landing, all 7 hubs (live and foundation
// alike), and every article. New articles need zero sitemap change: this
// iterates ALL_KNOWLEDGE_ARTICLES / KNOWLEDGE_CATEGORIES directly.
export function buildKnowledgeSitemapEntries(): SitemapUrlEntry[] {
  return [
    { url: `${FABRIC_SITE_ORIGIN}/knowledge`, changeFrequency: 'weekly', priority: 0.9 },
    ...KNOWLEDGE_CATEGORIES.map((category) => ({
      url: `${FABRIC_SITE_ORIGIN}/knowledge/${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...ALL_KNOWLEDGE_ARTICLES.map((article) => ({
      url: `${FABRIC_SITE_ORIGIN}/knowledge/${article.category}/${article.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
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
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n    <changefreq>${entry.changeFrequency}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
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
