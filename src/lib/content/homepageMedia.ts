import type { SupabaseClient } from '@supabase/supabase-js'

// Homepage Content Manager — a fixed set of image "slots" the site's
// hand-built sections read from, each optionally pointing at a
// website_media row. When a slot is empty the section falls back to its
// existing hardcoded asset (src/lib/marketing/assets.ts), so this is
// purely additive and can never blank a section.

export const HOMEPAGE_SLOTS = [
  { key: 'hero', label: 'Hero', hint: 'Visual utama paling atas homepage' },
  { key: 'fabric_highlight', label: 'Fabric Highlight', hint: 'Section sorotan bahan' },
  { key: 'craftsmanship', label: 'Craftsmanship', hint: 'Section proses / workshop' },
  { key: 'gallery_preview', label: 'Gallery Preview', hint: 'Cuplikan galeri di homepage' },
  { key: 'appointment', label: 'Private Appointment', hint: 'Section janji temu privat' },
  { key: 'consultation', label: 'Consultation', hint: 'Section konsultasi / video call' },
] as const
export type HomepageSlotKey = (typeof HOMEPAGE_SLOTS)[number]['key']

export interface HomepageSlotRow {
  slot_key: HomepageSlotKey
  media_id: string | null
  updated_at: string
}

export interface PublicHomepageSlot {
  slot_key: HomepageSlotKey
  media_path: string | null
  media_alt: string | null
}

// Public read — returns a map slot_key -> { path, alt } (path null when unset).
export async function fetchHomepageMediaMap(
  supabase: SupabaseClient
): Promise<Record<string, { path: string | null; alt: string | null }>> {
  const { data, error } = await supabase.rpc('get_homepage_media_slots')
  if (error) throw error
  const out: Record<string, { path: string | null; alt: string | null }> = {}
  for (const row of (data ?? []) as PublicHomepageSlot[]) {
    out[row.slot_key] = { path: row.media_path, alt: row.media_alt }
  }
  return out
}

export async function fetchHomepageSlots(supabase: SupabaseClient): Promise<HomepageSlotRow[]> {
  const { data, error } = await supabase.from('homepage_media_slots').select('*')
  if (error) throw error
  return (data ?? []) as HomepageSlotRow[]
}

export async function setHomepageSlot(
  supabase: SupabaseClient,
  slotKey: HomepageSlotKey,
  mediaId: string | null
): Promise<void> {
  const { error } = await supabase
    .from('homepage_media_slots')
    .update({ media_id: mediaId, updated_at: new Date().toISOString() })
    .eq('slot_key', slotKey)
  if (error) throw error
}
