import type { SupabaseClient } from '@supabase/supabase-js'
import type { MasterDataCategory } from '@/lib/design/masterData'
import { fetchPublicGalleryItems } from '@/lib/content/galleryItems'
import { websiteMediaUrl, websiteMediaSrcSet } from '@/lib/content/mediaUrl'
import { configuratorThumb, configuratorThumbSrcSet } from '@/lib/configurator/thumb'

// Sprint W3R first restored /gallery by reusing
// list_active_design_master_options() (model_thobe + look_cutting photos).
// Sprint DS-UX Scope B adds a real, Owner-managed gallery_items table
// (Owner OS -> Content -> Gallery). This repository now prefers curated
// gallery_items and only falls back to the old master-data source when the
// Owner hasn't curated anything yet — so /gallery is never empty during the
// migration and no existing URL breaks.
const GALLERY_CATEGORIES: MasterDataCategory[] = ['model_thobe', 'look_cutting']

export interface GalleryPiece {
  id: string
  name: string
  category: string
  photoUrl: string
  srcSet?: string
  source: 'curated' | 'catalog'
}

interface PublicMasterOptionRow {
  id: string
  category: MasterDataCategory
  name: string
  photo_url: string | null
}

const CURATED_IMG = { width: 900, height: 1200, quality: 70, resize: 'cover' as const }

export async function getGalleryPieces(supabase: SupabaseClient): Promise<GalleryPiece[]> {
  // 1 — curated gallery_items (preferred)
  const curated = await fetchPublicGalleryItems(supabase).catch(() => [])
  if (curated.length > 0) {
    const pieces: GalleryPiece[] = []
    for (const item of curated) {
      const photoUrl = websiteMediaUrl(item.media_path, CURATED_IMG)
      if (!photoUrl) continue
      pieces.push({
        id: item.id,
        name: item.caption || item.media_alt || 'Bespoke thobe',
        category: item.category,
        photoUrl,
        srcSet: websiteMediaSrcSet(item.media_path, CURATED_IMG),
        source: 'curated',
      })
    }
    if (pieces.length > 0) return pieces
  }

  // 2 — fallback: the Design Studio catalog photos (unchanged behaviour)
  const { data, error } = await supabase.rpc('list_active_design_master_options')
  if (error) throw error
  const rows = (data ?? []) as PublicMasterOptionRow[]
  return rows
    .filter((row) => GALLERY_CATEGORIES.includes(row.category) && !!row.photo_url)
    .map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      // Route the multi-MB catalog originals through the transform endpoint
      // too — same fix as the configurator (Sprint 2026-08-27).
      photoUrl: configuratorThumb(row.photo_url, 900, 70) ?? (row.photo_url as string),
      srcSet: configuratorThumbSrcSet(row.photo_url, 900, 70),
      source: 'catalog' as const,
    }))
}
