import { createPublicClient } from '@/lib/supabase/public'
import { buildImagesSitemapEntries, serializeImageSitemap } from '@/lib/sitemap/build'

export const revalidate = 3600

export async function GET() {
  const supabase = createPublicClient()
  const entries = await buildImagesSitemapEntries(supabase)
  const xml = serializeImageSitemap(entries)

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
