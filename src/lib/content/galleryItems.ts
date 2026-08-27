import type { SupabaseClient } from '@supabase/supabase-js'

// Gallery Manager data. The public /gallery page reads
// list_active_gallery_items() (SECURITY DEFINER, anon); staff CRUD hits the
// table under RLS. Each item points at a website_media row.

export interface GalleryItemRow {
  id: string
  media_id: string
  caption: string | null
  category: string
  sort_order: number
  featured: boolean
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface PublicGalleryItem {
  id: string
  caption: string | null
  category: string
  sort_order: number
  featured: boolean
  media_path: string
  media_alt: string
}

export async function fetchPublicGalleryItems(supabase: SupabaseClient): Promise<PublicGalleryItem[]> {
  const { data, error } = await supabase.rpc('list_active_gallery_items')
  if (error) throw error
  return (data ?? []) as PublicGalleryItem[]
}

export async function fetchAllGalleryItems(supabase: SupabaseClient): Promise<GalleryItemRow[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as GalleryItemRow[]
}

export async function addGalleryItem(
  supabase: SupabaseClient,
  input: { media_id: string; caption?: string; category?: string; featured?: boolean }
): Promise<GalleryItemRow> {
  // append to the end
  const { data: last } = await supabase
    .from('gallery_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextOrder = (last?.sort_order ?? -1) + 1
  const { data, error } = await supabase
    .from('gallery_items')
    .insert({
      media_id: input.media_id,
      caption: input.caption?.trim() || null,
      category: input.category || 'general',
      featured: input.featured ?? false,
      sort_order: nextOrder,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as GalleryItemRow
}

export async function updateGalleryItem(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Pick<GalleryItemRow, 'caption' | 'category' | 'featured' | 'status'>>
): Promise<void> {
  const { error } = await supabase
    .from('gallery_items')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function removeGalleryItem(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('gallery_items').delete().eq('id', id)
  if (error) throw error
}

// Persist a full re-order (array of ids in the desired order).
export async function reorderGalleryItems(supabase: SupabaseClient, orderedIds: string[]): Promise<void> {
  const now = new Date().toISOString()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('gallery_items').update({ sort_order: index, updated_at: now }).eq('id', id)
    )
  )
}
