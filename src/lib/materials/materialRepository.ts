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
  type FabricSpecifications,
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

// Sprint W3-3 §2 — Image Gallery. `gallery_images` is the real multi-photo
// source when an admin has filled it in; hero_image is the only fallback
// (the sole image column that existed before this sprint), so a material
// with neither field renders no gallery at all rather than a broken slot.
// Pure derivation, no DB call — kept in the repository per the brief's
// "semua tetap melalui repository" rather than inlined in a component.
export function getMaterialGallery(material: Pick<FabricMaterial, 'gallery_images' | 'hero_image'>): string[] {
  if (material.gallery_images && material.gallery_images.length > 0) {
    return material.gallery_images.filter((url): url is string => !!url)
  }
  return material.hero_image ? [material.hero_image] : []
}

// Sprint W3-3 §6 — Fabric Specifications. Real data first; climate/occasion
// fall back to a derivation from the (constrained, defined-vocabulary)
// `season` enum, drape_character/structure from the (constrained) `texture`
// enum — both safe because those two source fields have an actual fixed
// taxonomy. best_for/recommended_garments/comfort/durability have no
// structured source field to derive from, so their fallback is plain
// generic copy, never a fabricated claim about the specific material.
const CLIMATE_BY_SEASON: Record<string, string> = {
  tropical: 'Warm, humid climates',
  summer: 'Warm climates',
  all_season: 'All climates',
  formal: 'Temperate, indoor climates',
}
const OCCASION_BY_SEASON: Record<string, string> = {
  tropical: 'Everyday, casual wear',
  summer: 'Everyday, casual wear',
  all_season: 'Everyday and formal occasions',
  formal: 'Formal occasions',
}
const DRAPE_BY_TEXTURE: Record<string, string> = {
  soft: 'Fluid, soft drape',
  lustrous: 'Fluid, soft drape',
  structured: 'Structured, tailored drape',
  crisp: 'Structured, tailored drape',
  smooth: 'Balanced drape',
  matte: 'Balanced drape',
}
const STRUCTURE_BY_TEXTURE: Record<string, string> = {
  structured: 'Firm, holds shape',
  crisp: 'Firm, holds shape',
  soft: 'Relaxed, flexible',
  lustrous: 'Relaxed, flexible',
  smooth: 'Moderate structure',
  matte: 'Moderate structure',
}

export function getMaterialSpecifications(material: Pick<FabricMaterial, 'specifications' | 'season' | 'texture'>): Required<FabricSpecifications> {
  const spec = material.specifications ?? {}
  return {
    best_for: spec.best_for ?? 'Suitable for a range of bespoke thobe styles.',
    recommended_garments: spec.recommended_garments ?? 'Thobe, Jubah, and related bespoke garments.',
    climate: spec.climate ?? (material.season && CLIMATE_BY_SEASON[material.season]) ?? 'All climates',
    occasion: spec.occasion ?? (material.season && OCCASION_BY_SEASON[material.season]) ?? 'Everyday and formal occasions',
    drape_character: spec.drape_character ?? (material.texture && DRAPE_BY_TEXTURE[material.texture]) ?? 'Balanced drape',
    structure: spec.structure ?? (material.texture && STRUCTURE_BY_TEXTURE[material.texture]) ?? 'Moderate structure',
    comfort: spec.comfort ?? 'Comfortable for extended wear.',
    durability: spec.durability ?? 'Durable with proper care.',
  }
}

// Sprint W3-3 §7 — Use Case tags. Real `use_cases` first; otherwise derived
// from season + price_tier (both constrained enums), always returning at
// least one tag so the section never renders empty.
const USE_CASES_BY_SEASON: Record<string, string[]> = {
  tropical: ['Tropical Wear', 'Daily Thobe'],
  summer: ['Daily Thobe'],
  all_season: ['Daily Thobe', 'Business Wear'],
  formal: ['Formal Thobe', 'Business Wear'],
}

export function getMaterialUseCases(material: Pick<FabricMaterial, 'use_cases' | 'season' | 'price_tier'>): string[] {
  if (material.use_cases && material.use_cases.length > 0) {
    return material.use_cases.filter((tag): tag is string => !!tag)
  }

  const tags = new Set<string>(material.season ? USE_CASES_BY_SEASON[material.season] ?? [] : [])
  if (material.price_tier === 'luxury') tags.add('Eid Collection')
  if (tags.size === 0) tags.add('Daily Thobe')

  return Array.from(tags).slice(0, 4)
}

// Sprint W3-3 §9 — Related Materials. Scored across the whole published
// catalog (same category > similar texture > similar luxury_level), never
// including the material itself, capped at `limit` (brief: max 4).
// luxury_level match is a best-effort case-insensitive string compare —
// unlike category/texture it has no defined vocabulary (see
// FABRIC_SORT_LABELS.luxury_level's comment).
export async function getRelatedMaterials(supabase: SupabaseClient, material: FabricMaterial, limit = 4): Promise<FabricMaterial[]> {
  const { materials } = await listMaterials(supabase, { limit: FABRIC_MAX_CATALOG_FETCH })

  const scored = materials
    .filter((m) => m.id !== material.id)
    .map((m) => {
      let score = 0
      if (m.category === material.category) score += 3
      if (material.texture && m.texture === material.texture) score += 2
      if (material.luxury_level && m.luxury_level && m.luxury_level.toLowerCase() === material.luxury_level.toLowerCase()) score += 1
      return { material: m, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.material.name.localeCompare(b.material.name))

  return scored.slice(0, limit).map((entry) => entry.material)
}

// Sprint W3-3 §10 — Comparison Preview. Deliberately distinct from
// getRelatedMaterials: one representative per *other* category (not same-
// category siblings), so the comparison rail shows real cross-fabric
// variety ("Oxford Cotton / Italian Linen / Super 120 Wool" in the brief's
// own example) instead of duplicating the Related Materials rail.
export async function getComparisonCandidates(supabase: SupabaseClient, material: FabricMaterial, limit = 3): Promise<FabricMaterial[]> {
  const { materials } = await listMaterials(supabase, { limit: FABRIC_MAX_CATALOG_FETCH, sort: 'name_asc' })

  const seenCategories = new Set<string>([material.category])
  const candidates: FabricMaterial[] = []
  for (const m of materials) {
    if (m.id === material.id || seenCategories.has(m.category)) continue
    seenCategories.add(m.category)
    candidates.push(m)
    if (candidates.length >= limit) break
  }
  return candidates
}
