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

export interface FabricMaterial {
  id: string
  slug: string
  name: string
  category: FabricCategory
  composition: string | null
  weight_gsm: number | null
  texture: string | null
  breathability: string | null
  wrinkle_resistance: string | null
  luxury_level: string | null
  season: string | null
  care_instruction: string | null
  price_tier: string | null
  hero_image: string | null
  video_url: string | null
  published: boolean
}
