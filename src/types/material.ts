// Fabric Explorer (Sprint W3-1) — public-facing shape of a `materials` row,
// scoped to the columns public.list_fabric_catalog() exposes (see
// supabase/migrations/20260905000000_sprint_w3_1_fabric_explorer_foundation.sql
// and .../20260905000100_sprint_w3_1_fabric_catalog_function.sql). Named
// `FabricMaterial` rather than `Material` to avoid colliding with the
// unrelated (stock/price/supplier) `Material` type in
// src/lib/inventory/types.ts — both describe the same `materials` table but
// for entirely different audiences (Inventory staff vs. public visitors).

export const FABRIC_CATEGORIES = ['cotton', 'linen', 'wool', 'rayon', 'polyester', 'blend'] as const

export type FabricCategory = (typeof FABRIC_CATEGORIES)[number]

export const FABRIC_CATEGORY_LABELS: Record<FabricCategory, string> = {
  cotton: 'Cotton',
  linen: 'Linen',
  wool: 'Wool',
  rayon: 'Rayon',
  polyester: 'Polyester',
  blend: 'Blend',
}

export function isFabricCategory(value: string): value is FabricCategory {
  return (FABRIC_CATEGORIES as readonly string[]).includes(value)
}

// Short internal-linking / category-hero copy (Sprint W3-2 §9) — not
// Material Master data, just static per-category marketing copy.
export const FABRIC_CATEGORY_DESCRIPTIONS: Record<FabricCategory, string> = {
  cotton: 'Breathable, versatile, and easy to care for — cotton is the everyday foundation of bespoke tailoring.',
  linen: 'Airy and naturally textured, linen is built for warm climates and relaxed formality.',
  wool: 'Structured and resilient, wool holds a tailored silhouette through every season.',
  rayon: 'Fluid and lustrous, rayon drapes with a soft, fluid hand for a refined finish.',
  polyester: 'Durable and wrinkle-resistant, engineered for everyday wear without compromise.',
  blend: 'Composite fabrics balancing the strengths of two or more fibers in one cloth.',
}

// Sprint W3-2 §3 — brief's own enumerated value sets, stored as lowercase
// slugs (matches fabric_category's convention). Enforced at the DB layer
// by materials_texture_check / materials_season_check /
// materials_price_tier_check (20260906000000_sprint_w3_2_fabric_filter_taxonomy.sql).
export const FABRIC_TEXTURES = ['smooth', 'crisp', 'soft', 'structured', 'matte', 'lustrous'] as const
export type FabricTexture = (typeof FABRIC_TEXTURES)[number]
export const FABRIC_TEXTURE_LABELS: Record<FabricTexture, string> = {
  smooth: 'Smooth',
  crisp: 'Crisp',
  soft: 'Soft',
  structured: 'Structured',
  matte: 'Matte',
  lustrous: 'Lustrous',
}
export function isFabricTexture(value: string): value is FabricTexture {
  return (FABRIC_TEXTURES as readonly string[]).includes(value)
}

export const FABRIC_SEASONS = ['tropical', 'summer', 'all_season', 'formal'] as const
export type FabricSeason = (typeof FABRIC_SEASONS)[number]
export const FABRIC_SEASON_LABELS: Record<FabricSeason, string> = {
  tropical: 'Tropical',
  summer: 'Summer',
  all_season: 'All Season',
  formal: 'Formal',
}
export function isFabricSeason(value: string): value is FabricSeason {
  return (FABRIC_SEASONS as readonly string[]).includes(value)
}

export const FABRIC_PRICE_TIERS = ['basic', 'premium', 'luxury'] as const
export type FabricPriceTier = (typeof FABRIC_PRICE_TIERS)[number]
export const FABRIC_PRICE_TIER_LABELS: Record<FabricPriceTier, string> = {
  basic: 'Basic',
  premium: 'Premium',
  luxury: 'Luxury',
}
export function isFabricPriceTier(value: string): value is FabricPriceTier {
  return (FABRIC_PRICE_TIERS as readonly string[]).includes(value)
}

// "Weight" has no column of its own — weight_gsm (grams/m²) is continuous,
// so Lightweight/Medium/Heavy is a band derived at query time (same CASE
// expression lives in list_fabric_catalog()'s SQL — kept in sync manually,
// there being no shared place to compute it once for both SQL and TS).
// Thresholds are a reasonable apparel-fabric convention, not something
// either sprint brief specifies — flagged for the user to confirm/adjust
// once real fabric data exists.
export const FABRIC_WEIGHT_CLASSES = ['lightweight', 'medium', 'heavy'] as const
export type FabricWeightClass = (typeof FABRIC_WEIGHT_CLASSES)[number]
export const FABRIC_WEIGHT_CLASS_LABELS: Record<FabricWeightClass, string> = {
  lightweight: 'Lightweight',
  medium: 'Medium',
  heavy: 'Heavy',
}
export function isFabricWeightClass(value: string): value is FabricWeightClass {
  return (FABRIC_WEIGHT_CLASSES as readonly string[]).includes(value)
}
export function weightClassFromGsm(gsm: number | null): FabricWeightClass | null {
  if (gsm == null) return null
  if (gsm < 150) return 'lightweight'
  if (gsm <= 250) return 'medium'
  return 'heavy'
}

// Sprint W3-2 §6 — 'featured' (default) has no dedicated column to sort
// by; list_fabric_catalog() falls through to catalog insertion order
// (created_at asc) for it. 'luxury_level' sorts against a best-effort
// basic/standard=1 < premium=2 < luxury=3 ranking of whatever free text is
// stored — luxury_level, unlike price_tier, was never given an explicit
// value set by either sprint brief.
export const FABRIC_SORT_OPTIONS = ['featured', 'name_asc', 'name_desc', 'luxury_level', 'weight'] as const
export type FabricSortOption = (typeof FABRIC_SORT_OPTIONS)[number]
export const FABRIC_SORT_LABELS: Record<FabricSortOption, string> = {
  featured: 'Featured',
  name_asc: 'Name A-Z',
  name_desc: 'Name Z-A',
  luxury_level: 'Luxury Level',
  weight: 'Weight',
}
export function isFabricSortOption(value: string): value is FabricSortOption {
  return (FABRIC_SORT_OPTIONS as readonly string[]).includes(value)
}

// Sprint W3-3 §6 (Fabric Specifications) — free-form jsonb, all keys
// optional. No enum/vocabulary given by the brief for any of these, unlike
// texture/season/price_tier — stored as-authored text, rendered as-is or
// replaced by a generic safe fallback when absent (see
// getMaterialSpecifications() in materialRepository.ts).
export interface FabricSpecifications {
  best_for?: string
  recommended_garments?: string
  climate?: string
  occasion?: string
  drape_character?: string
  structure?: string
  comfort?: string
  durability?: string
}

export interface FabricMaterial {
  id: string
  slug: string
  name: string
  category: FabricCategory
  composition: string | null
  weight_gsm: number | null
  texture: FabricTexture | null
  breathability: string | null
  wrinkle_resistance: string | null
  luxury_level: string | null
  season: FabricSeason | null
  care_instruction: string | null
  price_tier: FabricPriceTier | null
  hero_image: string | null
  video_url: string | null
  published: boolean
  // Sprint W3-3 — gallery/specs/use-case data, all nullable (older rows
  // and freshly-created ones alike have none of this until an admin fills
  // it in). Every consumer must go through getMaterialGallery() /
  // getMaterialSpecifications() / getMaterialUseCases() rather than reading
  // these raw fields, so the "safe fallback when absent" behavior lives in
  // exactly one place.
  gallery_images: string[] | null
  specifications: FabricSpecifications | null
  use_cases: string[] | null
}

// Repository filter/sort/pagination input (Sprint W3-2 §10) — mirrors
// list_fabric_catalog()'s parameters 1:1.
export interface ListMaterialsParams {
  search?: string
  category?: FabricCategory
  texture?: FabricTexture
  weightClass?: FabricWeightClass
  season?: FabricSeason
  priceTier?: FabricPriceTier
  sort?: FabricSortOption
  limit?: number
}

export interface ListMaterialsResult {
  materials: FabricMaterial[]
  totalCount: number
}

// Available filter options for the current result set — intersected
// against real data (getMaterialFilterFacets) so the sidebar never offers
// an option with zero matching materials, mirroring how
// getMaterialCategories() already only returns categories in use.
// Shared page-size constants — repository (fetch limits) and URL helpers
// (Load More increment) both need the same numbers.
export const FABRIC_DEFAULT_PAGE_SIZE = 12
export const FABRIC_MAX_CATALOG_FETCH = 500

export interface FabricFilterFacets {
  categories: FabricCategory[]
  textures: FabricTexture[]
  weightClasses: FabricWeightClass[]
  seasons: FabricSeason[]
  priceTiers: FabricPriceTier[]
}

// Sprint W3-4 — public-safe shape of one material_colors row joined to its
// dna_colors row, scoped to the columns public.list_material_colors()
// exposes (see supabase/migrations/20260908000100_sprint_w3_4_material_colors_rpc.sql).
// `id` is the material_colors row's own id (the material<->color link),
// `dna_color_id` is the DNA Color Repository's real id — Design Studio
// deep-linking matches against the latter, never the former.
export interface MaterialColor {
  id: string
  dna_color_id: string
  name: string
  slug: string
  hex: string | null
  rgb: string | null
  family: string | null
  character: string | null
  reference_image: string | null
}

// "Color Family" grouping (§6) — real `family` values only, no invented
// taxonomy; a color with no `family` set falls into an explicit "Other"
// bucket rather than being silently dropped from the section.
export interface MaterialColorFamily {
  family: string
  colors: MaterialColor[]
}

export const UNSPECIFIED_COLOR_FAMILY = 'Other'

// AI render context preparation (§11) — a plain data object, never calls
// any AI/render API itself (the brief: "Belum perlu memanggil OpenAI").
// Mirrors the same fields the eventual render pipeline would need from a
// Fabric Explorer selection, without depending on or duplicating that
// pipeline's own types (renderService/DNA Resolver are Design Studio's,
// untouched by this sprint).
export interface FabricRenderContext {
  material: {
    id: string
    slug: string
    name: string
    category: FabricCategory
  }
  composition: string | null
  texture: FabricTexture | null
  weightGsm: number | null
  selectedColor: {
    id: string
    name: string
    hex: string | null
    family: string | null
    character: string | null
  } | null
}

// Sprint W3-5 §2/§13/§14 — FAQ Schema + AI-readable content. Generated
// from a material's own real fields (getMaterialFaq()), never invented
// per-SKU claims.
export interface FabricFaqItem {
  question: string
  answer: string
}

// Sprint W3-5 §6/§14 — Internal Linking Engine. One consolidated fetch
// (getInternalLinkTargets()) instead of each section/component querying
// independently — every list is already published-only, self-excluded,
// and capped by the repository, so components just render what they're
// given.
export interface InternalLinkTargets {
  related: FabricMaterial[]
  comparison: FabricMaterial[]
  sameTexture: FabricMaterial[]
  sameColorFamily: FabricMaterial[]
}

// Sprint W3-5 §14 — lightweight SEO/navigation context (category label +
// sibling categories), distinct from InternalLinkTargets: this is pure
// derivation over the fixed category taxonomy, no DB call, used for
// breadcrumb/category-hub navigation rather than material-to-material
// link rendering.
export interface SeoNeighbors {
  category: FabricCategory
  categoryLabel: string
  siblingCategories: FabricCategory[]
}

// Sprint W3-5 §5 — Material Authority Content. Every field is a sentence
// or two derived strictly from the material's own real data (composition,
// texture, season, weight, specifications, care_instruction) — never an
// invented claim about a specific SKU (see
// getMaterialAuthorityContent() in materialRepository.ts).
export interface MaterialAuthorityContent {
  whyChoose: string
  whenToWear: string
  climateSuitability: string
  tailoringRecommendation: string
  maintenanceGuide: string
}
