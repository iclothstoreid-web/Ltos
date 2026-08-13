import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { serializeSitemapIndex } from '@/lib/sitemap/build'

// Sprint W6-8 — sitemap split. /sitemap.xml is now a sitemap INDEX
// referencing the 3 sub-sitemaps (pages/knowledge/images), replacing the
// single flat file this project had since Sprint W3-5. robots.ts's
// `sitemap:` directive still points at this exact URL, so no other file
// needs to change for crawlers to discover the split.
export const revalidate = 3600

export function GET() {
  const xml = serializeSitemapIndex([
    `${FABRIC_SITE_ORIGIN}/sitemap-pages.xml`,
    `${FABRIC_SITE_ORIGIN}/sitemap-knowledge.xml`,
    `${FABRIC_SITE_ORIGIN}/sitemap-images.xml`,
  ])

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
