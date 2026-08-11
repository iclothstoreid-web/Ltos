import type { SupabaseClient } from '@supabase/supabase-js'
import {
  FABRIC_CATEGORIES,
  FABRIC_DEFAULT_PAGE_SIZE,
  FABRIC_MAX_CATALOG_FETCH,
  FABRIC_PRICE_TIERS,
  FABRIC_SEASONS,
  FABRIC_TEXTURES,
  FABRIC_WEIGHT_CLASSES,
  weightClassFromGsm,
  type FabricCategory,
  type FabricFilterFacets,
  type FabricMaterial,
  type ListMaterialsParams,
  type ListMaterialsResult,
} from '@/types/material'

interface FabricCatalogRow extends FabricMaterial {
  total_count: number
}

// Single Supabase call backing every repository function below —
// public.list_fabric_catalog() (SECURITY DEFINER RPC, anon-callable) is the
// only public read path onto `materials`; see
// supabase/migrations/20260905000100_sprint_w3_1_fabric_catalog_function.sql
// (why an RPC, not a view) and .../20260906000000_sprint_w3_2_fabric_filter_taxonomy.sql
// (the search/filter/sort/pagination signature). It already filters to
// published rows with a real slug + category, so "unpublished material"
// never appears here at all — callers don't need to re-check `published`.
// All filtering/sorting/pagination happens in this one DB round trip —
// nothing here re-filters an already-fetched array in JS.
export async function listMaterials(supabase: SupabaseClient, params: ListMaterialsParams = {}): Promise<ListMaterialsResult> {
  const { data, error } = await supabase.rpc('list_fabric_catalog', {
    p_search: params.search?.trim() || null,
    p_category: params.category ?? null,
    p_texture: params.texture ?? null,
    p_weight_class: params.weightClass ?? null,
    p_season: params.season ?? null,
    p_price_tier: params.priceTier ?? null,
    p_sort: params.sort ?? 'featured',
    p_limit: params.limit ?? FABRIC_DEFAULT_PAGE_SIZE,
    p_offset: 0,
  })
  if (error) throw error

  const rows = (data ?? []) as FabricCatalogRow[]
  const totalCount = rows[0]?.total_count ?? 0
  const materials = rows.map(({ total_count: _totalCount, ...material }) => material)
  return { materials, totalCount }
}

export async function getAllMaterials(supabase: SupabaseClient): Promise<FabricMaterial[]> {
  const { materials } = await listMaterials(supabase, { limit: FABRIC_MAX_CATALOG_FETCH, sort: 'name_asc' })
  return materials
}

export async function getMaterialBySlug(supabase: SupabaseClient, slug: string): Promise<FabricMaterial | null> {
  const materials = await getAllMaterials(supabase)
  return materials.find((m) => m.slug === slug) ?? null
}

export async function getMaterialsByCategory(supabase: SupabaseClient, category: FabricCategory): Promise<FabricMaterial[]> {
  const { materials } = await listMaterials(supabase, { category, limit: FABRIC_MAX_CATALOG_FETCH, sort: 'name_asc' })
  return materials
}

// Only categories with at least one published material — not the full
// FABRIC_CATEGORIES const — so the Explorer's category list never links to
// an empty page. Order follows FABRIC_CATEGORIES, not catalog order.
export async function getMaterialCategories(supabase: SupabaseClient): Promise<FabricCategory[]> {
  const materials = await getAllMaterials(supabase)
  const present = new Set(materials.map((m) => m.category))
  return FABRIC_CATEGORIES.filter((c) => present.has(c))
}

// Sprint W3-2 §3 — "Semua filter harus berasal dari data Material Master.
// Tidak boleh hardcode jika sudah tersedia di database": every filter
// group's option list is the canonical taxonomy (types/material.ts)
// intersected with what's actually present among published materials, same
// pattern getMaterialCategories() already uses for category. Optionally
// scoped to one category (category landing pages only need facets for
// materials already in that category).
export async function getMaterialFilterFacets(supabase: SupabaseClient, category?: FabricCategory): Promise<FabricFilterFacets> {
  const { materials } = await listMaterials(supabase, { category, limit: FABRIC_MAX_CATALOG_FETCH })

  const categories = new Set<string>()
  const textures = new Set<string>()
  const weightClasses = new Set<string>()
  const seasons = new Set<string>()
  const priceTiers = new Set<string>()

  for (const m of materials) {
    categories.add(m.category)
    if (m.texture) textures.add(m.texture)
    if (m.season) seasons.add(m.season)
    if (m.price_tier) priceTiers.add(m.price_tier)
    const weightClass = weightClassFromGsm(m.weight_gsm)
    if (weightClass) weightClasses.add(weightClass)
  }

  return {
    categories: FABRIC_CATEGORIES.filter((c) => categories.has(c)),
    textures: FABRIC_TEXTURES.filter((t) => textures.has(t)),
    weightClasses: FABRIC_WEIGHT_CLASSES.filter((w) => weightClasses.has(w)),
    seasons: FABRIC_SEASONS.filter((s) => seasons.has(s)),
    priceTiers: FABRIC_PRICE_TIERS.filter((p) => priceTiers.has(p)),
  }
}
