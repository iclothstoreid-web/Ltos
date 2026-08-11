import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'
import { getMaterialDiscoverySummary } from '@/lib/materials/materialRepository'
import { buildApiHeaders } from '@/lib/materials/apiHeaders'

// Sprint W3-6 §12 — AI Discovery Endpoint. Catalog-wide summary for future
// AI indexing (categories, materials, color families, textures, seasons,
// a lightweight category recommendation graph) — see
// getMaterialDiscoverySummary() in materialRepository.ts for why the graph
// is category-level, not a full material-to-material graph.
export const revalidate = 3600

export async function GET() {
  const supabase = createPublicClient()
  const summary = await getMaterialDiscoverySummary(supabase)
  return NextResponse.json(summary, { headers: buildApiHeaders() })
}
