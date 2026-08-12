import type { SupabaseClient } from '@supabase/supabase-js'
import type { MasterDataCategory } from '@/lib/design/masterData'

// Sprint W3R — restores a real /gallery instead of the W4.5 "coming soon"
// placeholder. There is no dedicated gallery table; per the brief's own
// "gunakan sumber yang paling sesuai dari asset yang sudah ada," this reuses
// public.list_active_design_master_options() — the same SECURITY DEFINER
// RPC (anon-callable, Sprint W3-4) the public Design Studio configurator
// already depends on for its catalog. model_thobe and look_cutting are the
// two categories that represent a finished garment "look" rather than a
// single component (kerah/manset/bahan/etc. are parts, not pieces) — the
// same 3 photos already hand-picked into src/lib/marketing/assets.ts for
// the homepage are literal rows from this exact table.
const GALLERY_CATEGORIES: MasterDataCategory[] = ['model_thobe', 'look_cutting']

export interface GalleryPiece {
  id: string
  name: string
  category: MasterDataCategory
  photoUrl: string
}

interface PublicMasterOptionRow {
  id: string
  category: MasterDataCategory
  name: string
  photo_url: string | null
}

export async function getGalleryPieces(supabase: SupabaseClient): Promise<GalleryPiece[]> {
  const { data, error } = await supabase.rpc('list_active_design_master_options')
  if (error) throw error

  const rows = (data ?? []) as PublicMasterOptionRow[]
  return rows
    .filter((row) => GALLERY_CATEGORIES.includes(row.category) && !!row.photo_url)
    .map((row) => ({ id: row.id, name: row.name, category: row.category, photoUrl: row.photo_url as string }))
}
