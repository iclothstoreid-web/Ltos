import { cache } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  FABRIC_CATEGORIES,
  FABRIC_CATEGORY_LABELS,
  FABRIC_DEFAULT_PAGE_SIZE,
  FABRIC_MAX_CATALOG_FETCH,
  FABRIC_PRICE_TIERS,
  FABRIC_SEASONS,
  FABRIC_SEASON_LABELS,
  FABRIC_TEXTURES,
  FABRIC_TEXTURE_LABELS,
  FABRIC_WEIGHT_CLASSES,
  LUXURY_LEVEL_MAX_RANK,
  UNSPECIFIED_COLOR_FAMILY,
  luxuryScoreFromLevel,
  weightClassFromGsm,
  type FabricCategory,
  type FabricFaqItem,
  type FabricFilterFacets,
  type FabricMaterial,
  type FabricRenderContext,
  type FabricSpecifications,
  type FabricTexture,
  type InternalLinkTargets,
  type ListMaterialsParams,
  type ListMaterialsResult,
  type MaterialAuthorityContent,
  type MaterialColor,
  type MaterialColorFamily,
  type MaterialDiscoverySummary,
  type MaterialReference,
  type RecommendationContext,
  type SemanticMaterialObject,
  type SeoNeighbors,
} from '@/types/material'
import { FABRIC_SITE_ORIGIN } from './seo'

// Sprint W3R.1 — Unify Fabric Data Source. Audit finding: the homepage's
// "Fabric Is Where Craft Begins" section and the Design Studio's own
// fabric picker have always read real, live, photographed rows from
// design_master_options (category='bahan') — the same table Sprint W3-4
// already exposed publicly via list_active_design_master_options(). The
// `materials` table (this file's original source, via list_fabric_catalog())
// has 13 rows but zero with published=true — 11 are genuine inventory
// items (thread, buttons, zippers) that were never meant to be public
// fabric-catalog entries, and the remaining 2 ("Lorenzo Premium Gold
// Class", "Dior") are real fabric stock but were never completed with a
// slug/category/publish flag. Two disconnected sources, one of them
// (materials) permanently empty in practice — not "different data," an
// unfinished migration.
//
// Fix: /fabric now reads from the SAME table the homepage does —
// design_master_options via list_active_design_master_options(), filtered
// to category='bahan' — instead of materials/list_fabric_catalog(). No new
// rows anywhere (zero migrations, zero inserts): every field below is
// either copied verbatim from a real column (id, name, price, photo_url)
// or mechanically derived from one (slug from name). Fields with no real
// source (composition beyond a literal "Wool & Silk" substring match
// against the option's own real selling_points copy, texture, weight,
// season, care_instruction, price_tier) are left null and fall through
// this file's existing generic-fallback functions (getMaterialSpecifications
// etc.) exactly as they already do for any material missing that data —
// no fabricated per-item claim. `materials`/list_fabric_catalog() is left
// completely intact in the database for if/when it gets real published
// data — this file simply stops calling it.
//
// list_active_design_master_options() takes no filter/sort/pagination
// parameters (it returns the full active catalog, by design — Design
// Studio needs every category at once), so all of that now happens here
// in JS instead of in the RPC's own SQL, same result shape either way.
// The bahan catalog is tiny (single digits of rows), so this costs
// nothing in practice.
interface DesignMasterOptionRow {
  id: string
  category: string
  name: string
  price: number | null
  photo_url: string | null
  selling_points: string[] | null
  sort_order: number
  material_id: string | null
  dna_color_id: string | null
}

const BAHAN_CATEGORY = 'bahan'
const WOOL_SILK_PATTERN = /wool\s*&\s*silk/i

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toFabricMaterial(row: DesignMasterOptionRow): FabricMaterial {
  const sellingText = row.selling_points?.join(' ') ?? ''
  const isWoolSilk = WOOL_SILK_PATTERN.test(sellingText) || WOOL_SILK_PATTERN.test(row.name)

  return {
    id: row.id,
    slug: slugify(row.name),
    name: row.name,
    // Every bahan option is a multi-fiber premium fabric by how it's
    // actually described (see the "Wool & Silk" note above) — 'blend' is
    // the one FABRIC_CATEGORIES value that doesn't assert a specific fiber
    // this data was never asked to distinguish, so it's the honest choice
    // rather than guessing 'cotton' vs 'wool' per item.
    category: 'blend',
    composition: isWoolSilk ? 'Wool & Silk Blend' : null,
    weight_gsm: null,
    texture: null,
    breathability: null,
    wrinkle_resistance: null,
    luxury_level: null,
    season: null,
    care_instruction: null,
    price_tier: null,
    hero_image: row.photo_url,
    video_url: null,
    published: true,
    gallery_images: null,
    specifications: null,
    use_cases: null,
  }
}

export async function listMaterials(supabase: SupabaseClient, params: ListMaterialsParams = {}): Promise<ListMaterialsResult> {
  const { data, error } = await supabase.rpc('list_active_design_master_options')
  if (error) throw error

  const rows = (data ?? []) as DesignMasterOptionRow[]
  let materials = rows.filter((row) => row.category === BAHAN_CATEGORY).map(toFabricMaterial)

  const search = params.search?.trim().toLowerCase()
  if (search) {
    materials = materials.filter(
      (m) => m.name.toLowerCase().includes(search) || (m.composition?.toLowerCase().includes(search) ?? false)
    )
  }
  if (params.category) materials = materials.filter((m) => m.category === params.category)
  if (params.texture) materials = materials.filter((m) => m.texture === params.texture)
  if (params.season) materials = materials.filter((m) => m.season === params.season)
  if (params.priceTier) materials = materials.filter((m) => m.price_tier === params.priceTier)
  if (params.weightClass) materials = materials.filter((m) => weightClassFromGsm(m.weight_gsm) === params.weightClass)

  if (params.sort === 'name_asc') materials = [...materials].sort((a, b) => a.name.localeCompare(b.name))
  else if (params.sort === 'name_desc') materials = [...materials].sort((a, b) => b.name.localeCompare(a.name))
  // 'luxury_level' / 'weight' / 'featured' (default): no source field to
  // rank by for this data, so the RPC's own category+sort_order order is
  // kept as-is rather than a no-op re-sort — same result, less work.

  const totalCount = materials.length
  const limit = params.limit ?? FABRIC_DEFAULT_PAGE_SIZE
  return { materials: materials.slice(0, limit), totalCount }
}

// Sprint W3-6 §10 — cache()-wrapped: the fabric detail page's
// generateMetadata and page body both resolve the same material by slug
// (each via getMaterialBySlug -> getAllMaterials), and the category page
// separately calls getMaterialFilterFacets/getMaterialCategories, which
// also go through this. Combined with createPublicClient() now also being
// cache()-wrapped (src/lib/supabase/public.ts) so every call site within
// one request shares the same client instance, repeated calls collapse
// into a single actual Supabase round trip per request instead of one per
// call site.
export const getAllMaterials = cache(async function getAllMaterials(supabase: SupabaseClient): Promise<FabricMaterial[]> {
  const { materials } = await listMaterials(supabase, { limit: FABRIC_MAX_CATALOG_FETCH, sort: 'name_asc' })
  return materials
})

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
//
// Sprint W3-4 §10 — Color-aware boost: when `selectedColorDnaId` is given
// (the DNA Color the user currently has selected on this material's detail
// page), materials that also carry that same color get a same-weight boost
// as a category match (+3) — "if viewing Navy Oxford Cotton, prioritize
// other materials that also come in Navy." One extra RPC call, not an
// N-query fan-out per candidate.
export async function getRelatedMaterials(
  supabase: SupabaseClient,
  material: FabricMaterial,
  limit = 4,
  selectedColorDnaId?: string | null
): Promise<FabricMaterial[]> {
  const [{ materials }, sameColorMaterialIds] = await Promise.all([
    listMaterials(supabase, { limit: FABRIC_MAX_CATALOG_FETCH }),
    selectedColorDnaId ? getMaterialIdsForColor(supabase, selectedColorDnaId) : Promise.resolve<Set<string>>(new Set()),
  ])

  const scored = materials
    .filter((m) => m.id !== material.id)
    .map((m) => {
      let score = 0
      if (m.category === material.category) score += 3
      if (material.texture && m.texture === material.texture) score += 2
      if (material.luxury_level && m.luxury_level && m.luxury_level.toLowerCase() === material.luxury_level.toLowerCase()) score += 1
      if (sameColorMaterialIds.has(m.id)) score += 3
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

// Sprint W3-4 §1-2 — Material Color Integration. public.list_material_colors()
// (SECURITY DEFINER RPC — see .../20260908000100_sprint_w3_4_material_colors_rpc.sql)
// is the only public read path onto material_colors/dna_colors, both
// staff-only under RLS; already filtered to active colors + active DNA
// Colors + a published material, so every caller here can treat the
// result as "this material's real, available colors" with no further
// checks. In-memory per-request result, not cached across requests —
// "tidak melakukan query DNA Color berulang" (§13) is honored by every
// caller on this page fetching colors exactly once and passing the result
// down as props, not by each component re-fetching independently.
export async function getMaterialColors(supabase: SupabaseClient, materialId: string): Promise<MaterialColor[]> {
  const { data, error } = await supabase.rpc('list_material_colors', { p_material_id: materialId })
  if (error) throw error
  return (data ?? []) as MaterialColor[]
}

// No `is_primary`/featured flag exists on material_colors — "primary"
// here is simply the first color in getMaterialColors()'s own order
// (dna_colors.name asc), a deterministic, disclosed choice rather than an
// invented ranking. Pure overload (primaryMaterialColorFrom) exists so a
// caller that already has the full color list (the detail page, which
// also needs the family grouping) doesn't re-fetch just to find the
// first entry — see §13 "tidak melakukan query DNA Color berulang".
export function primaryMaterialColorFrom(colors: MaterialColor[]): MaterialColor | null {
  return colors[0] ?? null
}

export async function getPrimaryMaterialColor(supabase: SupabaseClient, materialId: string): Promise<MaterialColor | null> {
  const colors = await getMaterialColors(supabase, materialId)
  return primaryMaterialColorFrom(colors)
}

// Sprint W3-4 §6 — Color Family grouping. Real `family` values only;
// colors with no family set are grouped under UNSPECIFIED_COLOR_FAMILY
// rather than dropped, and that bucket always sorts last so real families
// lead the section. Pure overload (groupMaterialColorsByFamily) for the
// same single-fetch reason as primaryMaterialColorFrom above.
export function groupMaterialColorsByFamily(colors: MaterialColor[]): MaterialColorFamily[] {
  const byFamily = new Map<string, MaterialColor[]>()
  for (const color of colors) {
    const family = color.family || UNSPECIFIED_COLOR_FAMILY
    const bucket = byFamily.get(family) ?? []
    bucket.push(color)
    byFamily.set(family, bucket)
  }

  return Array.from(byFamily.entries())
    .sort(([a], [b]) => {
      if (a === UNSPECIFIED_COLOR_FAMILY) return 1
      if (b === UNSPECIFIED_COLOR_FAMILY) return -1
      return a.localeCompare(b)
    })
    .map(([family, familyColors]) => ({ family, colors: familyColors }))
}

export async function getMaterialColorFamilies(supabase: SupabaseClient, materialId: string): Promise<MaterialColorFamily[]> {
  const colors = await getMaterialColors(supabase, materialId)
  return groupMaterialColorsByFamily(colors)
}

// Backs getRelatedMaterials()'s color-aware boost (§10) — which published
// materials also carry this DNA Color, via public.list_material_ids_for_color().
async function getMaterialIdsForColor(supabase: SupabaseClient, dnaColorId: string): Promise<Set<string>> {
  const { data, error } = await supabase.rpc('list_material_ids_for_color', { p_dna_color_id: dnaColorId })
  if (error) throw error
  return new Set((data ?? []).map((row: { material_id: string }) => row.material_id))
}

// Sprint W3-4 §11 / W3-6 §5 — AI Render Context Preparation. Pure data
// assembly, no AI/render API call of any kind (the brief: "Belum perlu
// memanggil OpenAI. Hanya memperkaya context.") — a future render
// integration consumes this shape without this sprint needing to know
// what that integration looks like. W3-6 enrichment (materialCharacter/
// textureDescription/luxuryDescription/renderKeywords) is composed
// entirely from fields already on `material`/`selectedColor`, not a new
// query or claim.
export function buildFabricRenderContext(material: FabricMaterial, selectedColor: MaterialColor | null): FabricRenderContext {
  const categoryLabel = FABRIC_CATEGORY_LABELS[material.category]
  const textureLabel = material.texture ? FABRIC_TEXTURE_LABELS[material.texture] : null

  const characterParts = [material.composition, textureLabel ? `${textureLabel.toLowerCase()} texture` : null].filter(
    (v): v is string => !!v
  )
  const materialCharacter = characterParts.length > 0 ? characterParts.join(', ') : `${categoryLabel} fabric`

  const textureDescription = textureLabel ? `${textureLabel} texture` : null

  const luxuryScore = luxuryScoreFromLevel(material.luxury_level)
  const luxuryDescription = material.luxury_level
    ? `${material.luxury_level}${luxuryScore ? ` (${luxuryScore}/${LUXURY_LEVEL_MAX_RANK})` : ''} tier`
    : null

  const renderKeywords = Array.from(
    new Set(
      [categoryLabel, textureLabel, material.luxury_level, selectedColor?.name, selectedColor?.family].filter(
        (v): v is string => !!v
      )
    )
  )

  return {
    material: {
      id: material.id,
      slug: material.slug,
      name: material.name,
      category: material.category,
    },
    composition: material.composition,
    texture: material.texture,
    weightGsm: material.weight_gsm,
    selectedColor: selectedColor
      ? {
          id: selectedColor.dna_color_id,
          name: selectedColor.name,
          hex: selectedColor.hex,
          family: selectedColor.family,
          character: selectedColor.character,
        }
      : null,
    materialCharacter,
    textureDescription,
    luxuryDescription,
    renderKeywords,
  }
}

// Sprint W3-5 §6/§14 — "related textures" internal linking. Any published
// material sharing this one's texture, any category, excluding itself.
// Deliberately not scored/blended with getRelatedMaterials — the brief
// lists "related textures" as its own internal-linking target distinct
// from "sibling materials".
export async function getRelatedByTexture(supabase: SupabaseClient, material: FabricMaterial, limit = 3): Promise<FabricMaterial[]> {
  if (!material.texture) return []
  const { materials } = await listMaterials(supabase, { texture: material.texture, limit: FABRIC_MAX_CATALOG_FETCH, sort: 'name_asc' })
  return materials.filter((m) => m.id !== material.id).slice(0, limit)
}

// Sprint W3-5 §6/§14 — "same color family" internal linking. Uses
// public.list_material_ids_for_color_family() (SECURITY DEFINER RPC —
// see .../20260909000000_sprint_w3_5_color_family_rpc.sql). `colors` is
// the already-fetched color list for this material (see the detail page,
// which fetches it once) — the family searched is the currently
// displayed color's (selected, or the primary/first if none selected),
// not every family this material happens to carry.
export async function getSameColorFamilyMaterials(
  supabase: SupabaseClient,
  material: FabricMaterial,
  family: string | null,
  limit = 3
): Promise<FabricMaterial[]> {
  if (!family) return []
  const { data, error } = await supabase.rpc('list_material_ids_for_color_family', { p_family: family })
  if (error) throw error

  const ids = new Set((data ?? []).map((row: { material_id: string }) => row.material_id))
  ids.delete(material.id)
  if (ids.size === 0) return []

  const { materials } = await listMaterials(supabase, { limit: FABRIC_MAX_CATALOG_FETCH, sort: 'name_asc' })
  return materials.filter((m) => ids.has(m.id)).slice(0, limit)
}

// Sprint W3-5 §6/§14 — Internal Linking Engine. One consolidated fetch
// (four independent queries run in parallel) instead of the detail page
// or its components each querying independently — "setiap halaman
// material harus menghubungkan ke parent category, sibling materials,
// related textures, same color family, comparison candidates" all come
// from this single call.
export async function getInternalLinkTargets(
  supabase: SupabaseClient,
  material: FabricMaterial,
  selectedColorDnaId: string | null,
  displayedColorFamily: string | null
): Promise<InternalLinkTargets> {
  const [related, comparison, sameTexture, sameColorFamily] = await Promise.all([
    getRelatedMaterials(supabase, material, 4, selectedColorDnaId),
    getComparisonCandidates(supabase, material, 3),
    getRelatedByTexture(supabase, material, 3),
    getSameColorFamilyMaterials(supabase, material, displayedColorFamily, 3),
  ])

  return { related, comparison, sameTexture, sameColorFamily }
}

// Sprint W3-5 §14 — lightweight SEO/navigation neighborhood. Pure
// derivation over the fixed category taxonomy, no DB call — for
// breadcrumb/category-hub navigation, not material-to-material link
// rendering (see getInternalLinkTargets for that).
export function getSeoNeighbors(material: Pick<FabricMaterial, 'category'>): SeoNeighbors {
  return {
    category: material.category,
    categoryLabel: FABRIC_CATEGORY_LABELS[material.category],
    siblingCategories: FABRIC_CATEGORIES.filter((c) => c !== material.category),
  }
}

// Sprint W3-5 §2/§13 — FAQ Schema + AI-readable content. Every answer is
// built strictly from this material's own real fields (or, where a field
// is genuinely absent, a general statement about the fiber category
// itself — never a fabricated claim about this specific SKU). Item count
// varies with data availability rather than padding out fixed slots with
// generic filler.
export function getMaterialFaq(material: FabricMaterial): FabricFaqItem[] {
  const categoryLabel = FABRIC_CATEGORY_LABELS[material.category]
  const faq: FabricFaqItem[] = []

  if (material.season) {
    const seasonLabel = FABRIC_SEASON_LABELS[material.season]
    const suitable = material.season === 'tropical' || material.season === 'summer' || material.season === 'all_season'
    faq.push({
      question: `Is ${material.name} suitable for tropical weather?`,
      answer: suitable
        ? `Yes. ${material.name} is a ${seasonLabel.toLowerCase()} fabric${material.texture ? ` with a ${FABRIC_TEXTURE_LABELS[material.texture].toLowerCase()} texture` : ''}, making it a comfortable choice for warm, humid climates.`
        : `${material.name} is best suited to ${seasonLabel.toLowerCase()} wear rather than tropical heat — it's a better fit for cooler or indoor formal occasions.`,
    })
  }

  if (material.wrinkle_resistance) {
    faq.push({
      question: `Does ${material.name} wrinkle easily?`,
      answer: `${material.name}'s wrinkle resistance is rated as: ${material.wrinkle_resistance}.`,
    })
  } else {
    faq.push({
      question: `Does ${material.name} wrinkle easily?`,
      answer: `Wrinkle behavior varies by weave and care routine. As a general property of ${categoryLabel.toLowerCase()} fabrics, see the Fabric Specifications and Maintenance Guide sections above for care recommendations.`,
    })
  }

  const recommendedGarments = material.specifications?.recommended_garments
  faq.push({
    question: `What garments are recommended for ${material.name}?`,
    answer: recommendedGarments
      ? `${recommendedGarments}`
      : `${material.name} suits Thobe, Jubah, and related bespoke garments, in keeping with its ${categoryLabel.toLowerCase()} composition.`,
  })

  faq.push({
    question: `Is ${material.name} suitable for custom thobe?`,
    answer: `Yes — ${material.name}${material.composition ? ` (${material.composition})` : ''} is part of Local Tailor's Fabric Explorer catalog and can be customized directly in Design Studio for a bespoke thobe.`,
  })

  if (material.care_instruction) {
    faq.push({
      question: `How do I care for ${material.name}?`,
      answer: material.care_instruction,
    })
  }

  return faq
}

// Sprint W3-5 §5 — Material Authority Content ("Why Choose This Fabric",
// "When to Wear It", "Climate Suitability", "Tailoring Recommendation",
// "Maintenance Guide"). Composed from real fields plus
// getMaterialSpecifications()'s own already-disclosed fallback text —
// never a new, separately-invented claim about the material.
export function getMaterialAuthorityContent(material: FabricMaterial): MaterialAuthorityContent {
  const categoryLabel = FABRIC_CATEGORY_LABELS[material.category]
  const specs = getMaterialSpecifications(material)
  const weightClass = weightClassFromGsm(material.weight_gsm)

  const whyChooseParts = [`${material.name} is a ${categoryLabel.toLowerCase()} fabric`]
  if (material.composition) whyChooseParts.push(`crafted from ${material.composition}`)
  if (material.texture) whyChooseParts.push(`with a ${FABRIC_TEXTURE_LABELS[material.texture].toLowerCase()} texture`)
  const whyChoose = `${whyChooseParts.join(', ')}. ${specs.comfort}`

  const whenToWear = `${specs.occasion}. ${specs.best_for}`

  const climateSuitability = material.season
    ? `Suited to ${FABRIC_SEASON_LABELS[material.season].toLowerCase()} wear. ${specs.climate}.`
    : `${specs.climate}.`

  const tailoringRecommendationParts = [specs.drape_character, specs.structure]
  if (weightClass) {
    const weightNote =
      weightClass === 'lightweight'
        ? 'Its lightweight hand suits a relaxed, breathable cut.'
        : weightClass === 'heavy'
          ? 'Its substantial weight holds a structured, formal cut well.'
          : 'Its medium weight works across both relaxed and structured cuts.'
    tailoringRecommendationParts.push(weightNote)
  }
  const tailoringRecommendation = `${tailoringRecommendationParts.join(' ')} ${specs.recommended_garments}`

  const maintenanceGuide = material.care_instruction ?? `${specs.durability} For specific care instructions, consult your tailor.`

  return { whyChoose, whenToWear, climateSuitability, tailoringRecommendation, maintenanceGuide }
}

function toMaterialReference(material: FabricMaterial): MaterialReference {
  return {
    name: material.name,
    slug: material.slug,
    category: material.category,
    url: `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}`,
  }
}

// Sprint W3-6 §3 — recommended_for / avoid_for derivation. Both lists are
// built only from fields with a real, defined vocabulary (season, weight
// class) plus getMaterialSpecifications()'s own already-disclosed text —
// never a fabricated claim about a specific SKU's untested performance
// ("Hindari klaim yang tidak didukung", carried forward from W3-5 §5).
function deriveRecommendedFor(material: FabricMaterial, specs: Required<FabricSpecifications>): string[] {
  const items = new Set<string>()
  if (specs.best_for) items.add(specs.best_for)
  if (material.season === 'tropical' || material.season === 'summer') items.add('Warm, humid climates')
  if (material.season === 'formal') items.add('Formal, indoor, cooler-weather occasions')
  if (material.season === 'all_season') items.add('Year-round wear')

  const weightClass = weightClassFromGsm(material.weight_gsm)
  if (weightClass === 'lightweight') items.add('Hot-weather daily wear')
  if (weightClass === 'heavy') items.add('Cooler-weather formal wear')

  return Array.from(items)
}

function deriveAvoidFor(material: FabricMaterial): string[] {
  const items = new Set<string>()
  if (material.season === 'formal') items.add('Very hot, humid outdoor conditions')
  if (material.season === 'tropical' || material.season === 'summer') items.add('Cold or heavily air-conditioned indoor settings')

  const weightClass = weightClassFromGsm(material.weight_gsm)
  if (weightClass === 'heavy') items.add('Hot, humid climates')
  if (weightClass === 'lightweight') items.add('Cold weather without additional layering')

  return Array.from(items)
}

// Sprint W3-6 §2/§3 — Semantic Material Object: the full AI Material
// Schema plus semantic enrichment. Composed entirely from already-fetched
// data (material + colors + colorFamilies + related materials) — the
// caller (a page or API route) fetches each of those exactly once via the
// existing repository functions and passes them in here; this function
// itself never queries anything, so it's equally cheap to call for a
// single material or in a loop over a list.
export function buildSemanticMaterialObject(
  material: FabricMaterial,
  colors: MaterialColor[],
  colorFamilies: MaterialColorFamily[],
  relatedMaterials: FabricMaterial[]
): SemanticMaterialObject {
  const specs = getMaterialSpecifications(material)
  const useCases = getMaterialUseCases(material)

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
    luxury_score: luxuryScoreFromLevel(material.luxury_level),
    season: material.season,
    care_instruction: material.care_instruction,
    specifications: specs,
    use_cases: useCases,
    dna_colors: colors,
    color_families: colorFamilies.map((f) => f.family),
    related_materials: relatedMaterials.map(toMaterialReference),
    recommended_for: deriveRecommendedFor(material, specs),
    avoid_for: deriveAvoidFor(material),
    climate: specs.climate,
    occasion: specs.occasion,
    drape: specs.drape_character,
    structure: specs.structure,
  }
}

// Sprint W3-6 §4 — Recommendation Context. Wraps a SemanticMaterialObject
// with neighbor lists reshaped for matching/recommendation use (a future
// chatbot, material/style/color recommendation) — distinct from
// InternalLinkTargets (W3-5), which is for on-page link rendering.
// `tags` is a flat, deduplicated set of short matchable terms for simple
// tag-overlap matching without full-text search.
export function buildRecommendationContext(
  semanticMaterial: SemanticMaterialObject,
  linkTargets: Pick<InternalLinkTargets, 'sameTexture' | 'sameColorFamily' | 'comparison'>
): RecommendationContext {
  const tags = new Set<string>([
    semanticMaterial.category,
    ...(semanticMaterial.texture ? [semanticMaterial.texture] : []),
    ...(semanticMaterial.season ? [semanticMaterial.season] : []),
    ...semanticMaterial.use_cases,
    ...semanticMaterial.color_families,
  ])

  return {
    material: semanticMaterial,
    similar_texture: linkTargets.sameTexture.map(toMaterialReference),
    similar_color_family: linkTargets.sameColorFamily.map(toMaterialReference),
    comparison_candidates: linkTargets.comparison.map(toMaterialReference),
    tags: Array.from(tags),
  }
}

// Sprint W3-6 §12 — AI Discovery Endpoint summary. Catalog-wide overview,
// not per-material detail (that's /api/materials/[slug]).
// `recommendationGraph` is category-to-category adjacency based on shared
// texture within the current catalog — deliberately not a full
// material-to-material graph (or one also factoring in color families,
// which would need a per-material color fetch), which would make this
// endpoint's payload scale with catalog size rather than staying a fixed,
// small summary.
export const getMaterialDiscoverySummary = cache(async function getMaterialDiscoverySummary(
  supabase: SupabaseClient
): Promise<MaterialDiscoverySummary> {
  const [materials, colorFamiliesResult] = await Promise.all([getAllMaterials(supabase), supabase.rpc('list_distinct_color_families')])

  if (colorFamiliesResult.error) throw colorFamiliesResult.error
  const colorFamilies = ((colorFamiliesResult.data ?? []) as { family: string }[]).map((row) => row.family)

  const presentCategories = FABRIC_CATEGORIES.filter((c) => materials.some((m) => m.category === c))
  const categories = presentCategories.map((slug) => ({
    slug,
    label: FABRIC_CATEGORY_LABELS[slug],
    materialCount: materials.filter((m) => m.category === slug).length,
  }))

  const texturesByCategory = new Map<FabricCategory, Set<FabricTexture>>()
  for (const m of materials) {
    if (!m.texture) continue
    const set = texturesByCategory.get(m.category) ?? new Set<FabricTexture>()
    set.add(m.texture)
    texturesByCategory.set(m.category, set)
  }
  const recommendationGraph = presentCategories.map((category) => {
    const ownTextures = texturesByCategory.get(category) ?? new Set<FabricTexture>()
    const relatedCategories = presentCategories.filter((other) => {
      if (other === category) return false
      const otherTextures = texturesByCategory.get(other) ?? new Set<FabricTexture>()
      return Array.from(ownTextures).some((t) => otherTextures.has(t))
    })
    return { category, relatedCategories }
  })

  const presentTextures = FABRIC_TEXTURES.filter((t) => materials.some((m) => m.texture === t))
  const presentSeasons = FABRIC_SEASONS.filter((s) => materials.some((m) => m.season === s))

  return {
    categories,
    materials: materials.map(toMaterialReference),
    colorFamilies,
    textures: presentTextures,
    seasons: presentSeasons,
    recommendationGraph,
    generatedAt: new Date().toISOString(),
  }
})
