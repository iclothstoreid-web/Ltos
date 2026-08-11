import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'
import {
  buildRecommendationContext,
  buildSemanticMaterialObject,
  getInternalLinkTargets,
  getMaterialBySlug,
  getMaterialColors,
  groupMaterialColorsByFamily,
} from '@/lib/materials/materialRepository'
import { buildApiHeaders } from '@/lib/materials/apiHeaders'

interface RouteParams {
  params: { slug: string }
}

// Sprint W3-6 §1/§2/§4 — AI Material API, single-material endpoint. Full
// AI Material Schema (under `.material`) plus recommendation-ready
// neighbor lists and tags alongside it — one response instead of two
// near-duplicate endpoints, since both are cheap once colors/related are
// already fetched (no per-neighbor extra query).
export const revalidate = 3600

export async function GET(_request: Request, { params }: RouteParams) {
  const supabase = createPublicClient()
  const material = await getMaterialBySlug(supabase, params.slug)

  if (!material) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404, headers: buildApiHeaders() })
  }

  const colors = await getMaterialColors(supabase, material.id)
  const colorFamilies = groupMaterialColorsByFamily(colors)
  const linkTargets = await getInternalLinkTargets(supabase, material, null, null)

  const semanticMaterial = buildSemanticMaterialObject(material, colors, colorFamilies, linkTargets.related)
  const recommendationContext = buildRecommendationContext(semanticMaterial, linkTargets)

  return NextResponse.json(recommendationContext, { headers: buildApiHeaders() })
}
