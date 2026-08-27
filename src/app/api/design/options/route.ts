import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'
import { getConfiguratorCatalog } from '@/lib/configurator/mapping'

// Public read-only catalog for the /design-studio configurator. Anonymous
// visitors are expected — this only ever returns getConfiguratorCatalog's
// already-public-safe shape (see src/lib/configurator/mapping.ts), never
// ai_dna/render_recipe/internal_notes.
//
// Audit 2026-08-27 — this was on the client's critical path to the first
// configurator image (fetch on mount → then image loads) and a cold
// invocation measured ~865 ms TTFB in production. It has no per-request
// input and the catalog only changes on a Master Data edit, so it now
// uses the cookie-free anon client and is revalidated on a 5-minute ISR
// window + served with an explicit CDN cache header. Master Data edits
// surface within `revalidate` seconds; `stale-while-revalidate` keeps the
// endpoint instant while that refresh happens in the background.
export const revalidate = 300

export async function GET() {
  const supabase = createPublicClient()

  try {
    const catalog = await getConfiguratorCatalog(supabase)
    return NextResponse.json(catalog, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load configurator catalog.' },
      { status: 500 }
    )
  }
}
