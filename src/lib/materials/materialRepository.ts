import type { SupabaseClient } from '@supabase/supabase-js'
import { FABRIC_CATEGORIES, type FabricCategory, type FabricMaterial } from '@/types/material'

// Single Supabase call backing all four repository functions below —
// public.list_fabric_catalog() (SECURITY DEFINER RPC, anon-callable) is the
// only public read path onto `materials`; see
// supabase/migrations/20260905000100_sprint_w3_1_fabric_catalog_function.sql
// for why this is an RPC rather than a view. It already filters to
// published rows with a real slug + category, so "unpublished material"
// never appears here at all — callers don't need to re-check `published`.
async function fetchFabricCatalog(supabase: SupabaseClient): Promise<FabricMaterial[]> {
  const { data, error } = await supabase.rpc('list_fabric_catalog')
  if (error) throw error
  return (data ?? []) as FabricMaterial[]
}

export async function getAllMaterials(supabase: SupabaseClient): Promise<FabricMaterial[]> {
  const materials = await fetchFabricCatalog(supabase)
  return materials.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getMaterialBySlug(supabase: SupabaseClient, slug: string): Promise<FabricMaterial | null> {
  const materials = await fetchFabricCatalog(supabase)
  return materials.find((m) => m.slug === slug) ?? null
}

export async function getMaterialsByCategory(supabase: SupabaseClient, category: FabricCategory): Promise<FabricMaterial[]> {
  const materials = await getAllMaterials(supabase)
  return materials.filter((m) => m.category === category)
}

// Only categories with at least one published material — not the full
// FABRIC_CATEGORIES const — so the Explorer's category list never links to
// an empty page. Order follows FABRIC_CATEGORIES, not catalog order.
export async function getMaterialCategories(supabase: SupabaseClient): Promise<FabricCategory[]> {
  const materials = await fetchFabricCatalog(supabase)
  const present = new Set(materials.map((m) => m.category))
  return FABRIC_CATEGORIES.filter((c) => present.has(c))
}
