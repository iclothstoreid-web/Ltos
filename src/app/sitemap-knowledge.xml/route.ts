import { buildKnowledgeSitemapEntries, serializeUrlSitemap } from '@/lib/sitemap/build'

export const revalidate = 3600

export function GET() {
  const entries = buildKnowledgeSitemapEntries()
  const xml = serializeUrlSitemap(entries)

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
