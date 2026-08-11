import { NextResponse, type NextRequest } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'
import { getMaterialSpecifications, getMaterialUseCases, listMaterials } from '@/lib/materials/materialRepository'
import { buildApiHeaders } from '@/lib/materials/apiHeaders'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import {
  isFabricCategory,
  isFabricPriceTier,
  isFabricSeason,
  isFabricSortOption,
  isFabricTexture,
  isFabricWeightClass,
  weightClassFromGsm,
} from '@/types/material'

// Sprint W3-6 §1/§6 — AI Material API, list endpoint. Same filter
// vocabulary as the Fabric Explorer's own ?search=/?category=/etc. (see
// searchParamsHelpers.ts) so the API and the website stay in sync, but a
// deliberately lighter per-item payload than /api/materials/[slug] — no
// dna_colors/related_materials here, which would mean one extra query per
// item in a list response. "Jangan mengirim field yang tidak diperlukan."
export const revalidate = 3600

function paramOrUndefined(searchParams: URLSearchParams, key: string): string | undefined {
  const value = searchParams.get(key)
  return value ?? undefined
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const rawCategory = paramOrUndefined(sp, 'category')
  const rawTexture = paramOrUndefined(sp, 'texture')
  const rawWeight = paramOrUndefined(sp, 'weight')
  const rawSeason = paramOrUndefined(sp, 'season')
  const rawPriceTier = paramOrUndefined(sp, 'price_tier')
  const rawSort = paramOrUndefined(sp, 'sort')
  const rawLimit = paramOrUndefined(sp, 'limit')
  const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : NaN

  const supabase = createPublicClient()
  const { materials, totalCount } = await listMaterials(supabase, {
    search: paramOrUndefined(sp, 'search'),
    category: rawCategory && isFabricCategory(rawCategory) ? rawCategory : undefined,
    texture: rawTexture && isFabricTexture(rawTexture) ? rawTexture : undefined,
    weightClass: rawWeight && isFabricWeightClass(rawWeight) ? rawWeight : undefined,
    season: rawSeason && isFabricSeason(rawSeason) ? rawSeason : undefined,
    priceTier: rawPriceTier && isFabricPriceTier(rawPriceTier) ? rawPriceTier : undefined,
    sort: rawSort && isFabricSortOption(rawSort) ? rawSort : undefined,
    limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 96) : undefined,
  })

  const items = materials.map((material) => {
    const specifications = getMaterialSpecifications(material)
    return {
      name: material.name,
      slug: material.slug,
      url: `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}`,
      category: material.category,
      composition: material.composition,
      texture: material.texture,
      weight_gsm: material.weight_gsm,
      weight_class: weightClassFromGsm(material.weight_gsm),
      breathability: material.breathability,
      wrinkle_resistance: material.wrinkle_resistance,
      luxury_level: material.luxury_level,
      season: material.season,
      care_instruction: material.care_instruction,
      specifications,
      use_cases: getMaterialUseCases(material),
    }
  })

  return NextResponse.json(
    { count: items.length, total_count: totalCount, materials: items },
    { headers: buildApiHeaders() }
  )
}
