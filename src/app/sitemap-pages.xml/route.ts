import { createPublicClient } from '@/lib/supabase/public'
import { buildPagesSitemapEntries, serializeUrlSitemap } from '@/lib/sitemap/build'

export const revalidate = 3600

export async function GET() {
  const supabase = createPublicClient()
  const entries = await buildPagesSitemapEntries(supabase)
  const xml = serializeUrlSitemap(entries)

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
