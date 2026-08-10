import type { SupabaseClient } from '@supabase/supabase-js'

// DNA Color Repository — the single AI Knowledge source of truth for color
// (Architecture Lock: "DNA Color BUKAN katalog supplier... tidak boleh ada
// duplikasi DNA Color"). A DNA Color may only be created/edited here
// (/owner/dna-colors) — never from the Material admin ("Tidak boleh membuat
// DNA baru dari halaman Material").
//
// The render pipeline (DNA Resolver / ai_dna / render_recipe / Capability
// Engine) still resolves every renderable component strictly by
// design_master_options id — retiring 'warna_bahan' as a category would
// strip color of that whole machinery. So each dna_colors row keeps exactly
// one mirrored design_master_options row (category 'warna_bahan') as a 1:1
// technical handle for the render pipeline; dna_color_id is the FK back to
// the one real source of color knowledge. syncDnaColorMirror keeps that
// mirror's name/metadata.hex in sync — nothing downstream (ColorSelector's
// option.name, order snapshots, DNA Resolver) needs to know it exists.

export type DnaColorStatus = 'draft' | 'active' | 'archived'

export interface DnaColor {
  id: string
  name: string
  slug: string
  family: string | null
  character: string | null
  prompt: string | null
  reference_image: string | null
  rgb: string | null
  hex: string | null
  lab: string | null
  hsv: string | null
  version: number
  status: DnaColorStatus
  created_at: string
  updated_at: string
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

export async function fetchDnaColors(supabase: SupabaseClient): Promise<DnaColor[]> {
  const { data, error } = await supabase.from('dna_colors').select('*').order('name', { ascending: true })
  if (error) throw error
  return (data ?? []) as DnaColor[]
}

// Design Studio / Material Colors picker only ever offer active DNA Colors.
export async function fetchActiveDnaColors(supabase: SupabaseClient): Promise<DnaColor[]> {
  const { data, error } = await supabase
    .from('dna_colors')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as DnaColor[]
}

export interface DnaColorInput {
  name: string
  family?: string | null
  character?: string | null
  prompt?: string | null
  reference_image?: string | null
  rgb?: string | null
  hex?: string | null
  lab?: string | null
  hsv?: string | null
  version?: number
  status?: DnaColorStatus
}

export async function createDnaColor(supabase: SupabaseClient, params: DnaColorInput): Promise<DnaColor> {
  const { data, error } = await supabase
    .from('dna_colors')
    .insert({
      name: params.name.trim(),
      slug: slugify(params.name),
      family: params.family ?? null,
      character: params.character ?? null,
      prompt: params.prompt ?? null,
      reference_image: params.reference_image ?? null,
      rgb: params.rgb ?? null,
      hex: params.hex ?? null,
      lab: params.lab ?? null,
      hsv: params.hsv ?? null,
      version: params.version ?? 1,
      status: params.status ?? 'draft',
    })
    .select('*')
    .single()

  if (error) throw error
  const color = data as DnaColor
  await syncDnaColorMirror(supabase, color)
  return color
}

// PS-01.2 (Optimistic Conflict Protection) — `expectedUpdatedAt` is the
// `updated_at` DnaColorManager last loaded this row at (set when the Ubah
// form opens). Without this, two admins editing the same DNA Color around
// the same time would have the second save's full-form write silently
// overwrite whatever fields the first admin had just changed — this is a
// whole-row blind overwrite (every field re-sent every save), the same
// shape updateMasterDataOption() (design_master_options, Sprint PR-05) was
// fixed for.
export class StaleDnaColorError extends Error {
  constructor() {
    super('DNA Color ini sudah diubah oleh proses lain sejak terakhir dimuat. Muat ulang sebelum menyimpan lagi.')
    this.name = 'StaleDnaColorError'
  }
}

export async function updateDnaColor(
  supabase: SupabaseClient,
  id: string,
  params: DnaColorInput,
  expectedUpdatedAt: string
): Promise<DnaColor> {
  const { data, error } = await supabase
    .from('dna_colors')
    .update({
      name: params.name.trim(),
      family: params.family ?? null,
      character: params.character ?? null,
      prompt: params.prompt ?? null,
      reference_image: params.reference_image ?? null,
      rgb: params.rgb ?? null,
      hex: params.hex ?? null,
      lab: params.lab ?? null,
      hsv: params.hsv ?? null,
      version: params.version ?? 1,
      status: params.status ?? 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('updated_at', expectedUpdatedAt)
    .select('*')

  if (error) throw error
  if (!data || data.length === 0) {
    throw new StaleDnaColorError()
  }
  const color = data[0] as DnaColor
  await syncDnaColorMirror(supabase, color)
  return color
}

// Archive, never delete — same "Nonaktifkan" precedent as every other
// Master Data category (history/Order lama keeps reading the frozen name).
export async function archiveDnaColor(supabase: SupabaseClient, id: string): Promise<void> {
  const { data, error } = await supabase
    .from('dna_colors')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  await syncDnaColorMirror(supabase, data as DnaColor)
}

export async function syncDnaColorMirror(supabase: SupabaseClient, color: DnaColor): Promise<void> {
  // `metadata` selected here (not just `id`) so the update below can merge
  // onto it rather than replace it — a bare `{ metadata: { hex, color_family } }`
  // would silently wipe any other key the mirror row's metadata ever picks
  // up (e.g. hand-added Tabel Spesifikasi rows), even though this sync only
  // ever intends to touch hex/color_family.
  const { data: existing, error: findError } = await supabase
    .from('design_master_options')
    .select('id, metadata')
    .eq('category', 'warna_bahan')
    .eq('dna_color_id', color.id)
    .maybeSingle()

  if (findError) throw findError

  const metadataUpdates: Record<string, string> = {}
  if (color.hex) metadataUpdates.hex = color.hex
  if (color.family) metadataUpdates.color_family = color.family

  if (existing) {
    const { error } = await supabase
      .from('design_master_options')
      .update({
        name: color.name,
        metadata: { ...(existing.metadata ?? {}), ...metadataUpdates },
        is_active: color.status === 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) throw error
    return
  }

  const { data: last } = await supabase
    .from('design_master_options')
    .select('sort_order')
    .eq('category', 'warna_bahan')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('design_master_options').insert({
    category: 'warna_bahan',
    name: color.name,
    metadata: metadataUpdates,
    dna_color_id: color.id,
    is_active: color.status === 'active',
    sort_order: (last?.sort_order ?? 0) + 1,
  })

  if (error) throw error
}
