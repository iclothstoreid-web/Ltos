import type { SupabaseClient } from '@supabase/supabase-js'

// Central Media Library for the public website — distinct from the
// configurator's `master-data-photos` (product catalog) and from
// `consultation-photos` / `production-evidence` (real customer/staff
// media, never publishable). Stored in the dedicated public `website-media`
// bucket; DB rows here carry the metadata (alt text, category, status) and
// the Storage path. See supabase/migrations/20260827000000_*.

export const WEBSITE_MEDIA_CATEGORIES = [
  'homepage',
  'gallery',
  'fabric',
  'journal',
  'location',
  'craftsmanship',
  'appointment',
  'general',
] as const
export type WebsiteMediaCategory = (typeof WEBSITE_MEDIA_CATEGORIES)[number]

export interface WebsiteMedia {
  id: string
  storage_path: string
  title: string
  alt_text: string
  caption: string | null
  category: WebsiteMediaCategory
  width: number | null
  height: number | null
  byte_size: number | null
  mime_type: string | null
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}

const BUCKET = 'website-media'
const TABLE = 'website_media'

export async function fetchWebsiteMedia(
  supabase: SupabaseClient,
  opts: { category?: WebsiteMediaCategory | 'all'; includeArchived?: boolean } = {}
): Promise<WebsiteMedia[]> {
  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false })
  if (opts.category && opts.category !== 'all') query = query.eq('category', opts.category)
  if (!opts.includeArchived) query = query.eq('status', 'active')
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as WebsiteMedia[]
}

export async function fetchWebsiteMediaByIds(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, WebsiteMedia>> {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (unique.length === 0) return new Map()
  const { data, error } = await supabase.from(TABLE).select('*').in('id', unique)
  if (error) throw error
  return new Map((data as WebsiteMedia[]).map((m) => [m.id, m]))
}

// Uploads the file to `website-media/<category>/<uuid>.<ext>` then inserts
// the registry row. 30-day cache like master-data uploads (Smart CDN
// purges on any re-upsert). `probe` optionally carries client-measured
// natural dimensions.
export async function uploadWebsiteMedia(
  supabase: SupabaseClient,
  params: {
    file: File
    title: string
    altText: string
    caption?: string
    category: WebsiteMediaCategory
    width?: number
    height?: number
  }
): Promise<WebsiteMedia> {
  const ext = (params.file.name.split('.').pop() || 'jpg').toLowerCase()
  const id = crypto.randomUUID()
  const path = `${params.category}/${id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, params.file, { upsert: false, cacheControl: '2592000', contentType: params.file.type || undefined })
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      storage_path: path,
      title: params.title.trim(),
      alt_text: params.altText.trim(),
      caption: params.caption?.trim() || null,
      category: params.category,
      width: params.width ?? null,
      height: params.height ?? null,
      byte_size: params.file.size,
      mime_type: params.file.type || null,
    })
    .select('*')
    .single()
  if (error) {
    // best-effort rollback of the orphaned object
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {})
    throw error
  }
  return data as WebsiteMedia
}

export async function updateWebsiteMedia(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Pick<WebsiteMedia, 'title' | 'alt_text' | 'caption' | 'category' | 'status'>>
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// Hard delete — only allowed when nothing references the row. The caller
// (Media Library UI) checks usage first; the DB will also reject if a
// gallery_items row still points here (ON DELETE CASCADE would remove the
// gallery item, which we don't want silently, so the UI guards it).
export async function deleteWebsiteMedia(supabase: SupabaseClient, media: WebsiteMedia): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', media.id)
  if (error) throw error
  await supabase.storage.from(BUCKET).remove([media.storage_path]).catch(() => {})
}

// Where is this media used? Powers the Media Library "safe to delete?"
// guard and the usage column.
export async function fetchWebsiteMediaUsage(
  supabase: SupabaseClient,
  id: string
): Promise<{ gallery: number; journalCover: number; journalOg: number; homepageSlots: string[] }> {
  const [gallery, journalCover, journalOg, slots] = await Promise.all([
    supabase.from('gallery_items').select('id', { count: 'exact', head: true }).eq('media_id', id),
    supabase.from('journal_articles').select('id', { count: 'exact', head: true }).eq('cover_media_id', id),
    supabase.from('journal_articles').select('id', { count: 'exact', head: true }).eq('og_media_id', id),
    supabase.from('homepage_media_slots').select('slot_key').eq('media_id', id),
  ])
  return {
    gallery: gallery.count ?? 0,
    journalCover: journalCover.count ?? 0,
    journalOg: journalOg.count ?? 0,
    homepageSlots: (slots.data ?? []).map((r: { slot_key: string }) => r.slot_key),
  }
}

export { BUCKET as WEBSITE_MEDIA_BUCKET }
