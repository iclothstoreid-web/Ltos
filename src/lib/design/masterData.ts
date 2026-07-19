import type { SupabaseClient } from '@supabase/supabase-js'
import type { AiDesignDna } from './aiDna/types'
import { markDnaNeedsRegeneration } from './aiDna/types'
import type { RenderRecipe } from './renderRecipe/types'

// Single reusable structure for the whole Product Knowledge Base — Model
// Thobe, Look Cutting, Kerah, Manset, Plaket, Saku, Bahan, Warna Bahan,
// Aksesori. One table instead of one-table-per-category, per the brief
// ("Jangan membuat tabel spesifikasi terpisah untuk setiap kategori").
// `metadata` is the flexible key-value "Tabel Spesifikasi" (e.g. Warna
// Bahan's hex code) — reused as-is rather than adding a second parallel
// JSON column.
//
// LOCK: this list of categories is fixed. Owner/Fitter can only add/edit/
// deactivate/delete ITEMS inside an existing category (e.g. "Italian Wool"
// under Material) — never a new category itself ("Wool", "Kain Premium").
// A new category may only be introduced by an architecture change (a DB
// migration extending design_master_options_category_check to match this
// array), never through the UI. There is no "+ Kategori Baru" affordance.
export const MASTER_DATA_CATEGORIES = [
  'model_thobe',
  'look_cutting',
  'kerah',
  'manset',
  'plaket',
  'saku',
  'bahan',
  'warna_bahan',
  'aksesori',
  'bordir',
  'handmade_zigzag',
] as const

export type MasterDataCategory = (typeof MASTER_DATA_CATEGORIES)[number]

export const MASTER_DATA_CATEGORY_LABELS: Record<MasterDataCategory, string> = {
  model_thobe: 'Model Thobe',
  look_cutting: 'Look Cutting',
  kerah: 'Kerah',
  manset: 'Manset',
  plaket: 'Plaket',
  saku: 'Saku',
  bahan: 'Material',
  warna_bahan: 'Warna Material',
  aksesori: 'Aksesori',
  bordir: 'Bordir',
  handmade_zigzag: 'Handmade Zig-Zag',
}

export function masterDataCategoryLabel(category: MasterDataCategory): string {
  return MASTER_DATA_CATEGORY_LABELS[category]
}

// Handmade Zig-Zag identifies items by motif rather than a generic name —
// this only swaps the form label, the underlying `name` column is unchanged.
export const MASTER_DATA_NAME_LABEL: Record<MasterDataCategory, string> = {
  model_thobe: 'Nama',
  look_cutting: 'Nama',
  kerah: 'Nama',
  manset: 'Nama',
  plaket: 'Nama',
  saku: 'Nama',
  bahan: 'Nama',
  warna_bahan: 'Nama',
  aksesori: 'Nama',
  bordir: 'Nama',
  handmade_zigzag: 'Nama Motif',
}

export interface MasterDataOption {
  id: string
  category: MasterDataCategory
  name: string
  metadata: Record<string, string>
  sort_order: number
  is_active: boolean
  photo_url: string | null
  selling_points: string[]
  internal_notes: string
  price: number
  // Permanent AI Design DNA lifecycle object — DB column has a NOT NULL
  // default (see migration add_ai_design_dna_to_master_options), so every
  // row, old or new, always has one; see src/lib/design/aiDna/types.ts.
  ai_dna: AiDesignDna
  // Permanent Render Recipe object — same DB-default guarantee as ai_dna
  // (see migration add_render_recipe_to_master_options). Read-only from
  // this app's code this sprint; no editor/mutation path exists yet, see
  // src/lib/design/renderRecipe/types.ts.
  render_recipe: RenderRecipe
}

export type MasterOptionsByCategory = Record<MasterDataCategory, MasterDataOption[]>

// Roles allowed to manage the Product Knowledge Base — Owner OS (admin,
// owner) and Fitter (artisan), per the locked decision that Fitter gets the
// exact same access as Owner OS, no separate implementation. Single source
// of truth for this role list: both the master-data page gate and Design
// Studio's "Kelola Master Data" button read it from here, and the DB RLS
// policies mirror it.
const MASTER_DATA_MANAGER_ROLES = ['admin', 'owner', 'artisan']

export function canManageMasterData(role: string | null | undefined): boolean {
  return !!role && MASTER_DATA_MANAGER_ROLES.includes(role)
}

function emptyGroups(): MasterOptionsByCategory {
  return MASTER_DATA_CATEGORIES.reduce((acc, category) => {
    acc[category] = []
    return acc
  }, {} as MasterOptionsByCategory)
}

function groupByCategory(rows: MasterDataOption[]): MasterOptionsByCategory {
  const groups = emptyGroups()
  rows.forEach(row => {
    groups[row.category].push(row)
  })
  return groups
}

// Design Studio only ever offers active options to pick from.
export async function fetchActiveMasterOptions(
  supabase: SupabaseClient
): Promise<MasterOptionsByCategory> {
  const { data, error } = await supabase
    .from('design_master_options')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw error
  return groupByCategory((data ?? []) as MasterDataOption[])
}

// Master Data admin management needs both active and nonaktif rows so
// nothing already used by an Order silently disappears from view.
export async function fetchAllMasterOptions(supabase: SupabaseClient): Promise<MasterOptionsByCategory> {
  const { data, error } = await supabase
    .from('design_master_options')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw error
  return groupByCategory((data ?? []) as MasterDataOption[])
}

export function firstActiveOptionName(options: MasterDataOption[] | undefined): string {
  return options && options.length > 0 ? options[0].name : ''
}

export async function createMasterDataOption(
  supabase: SupabaseClient,
  params: { category: MasterDataCategory; name: string; metadata?: Record<string, string>; price?: number }
): Promise<void> {
  const { data: existing } = await supabase
    .from('design_master_options')
    .select('sort_order')
    .eq('category', params.category)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('design_master_options').insert({
    category: params.category,
    name: params.name.trim(),
    metadata: params.metadata ?? {},
    price: params.price ?? 0,
    sort_order: (existing?.sort_order ?? 0) + 1,
  })

  if (error) throw error
}

export interface UpdateMasterDataOptionParams {
  name: string
  metadata?: Record<string, string>
  photo_url?: string | null
  selling_points?: string[]
  internal_notes?: string
  price?: number
  // The row's current photo_url/ai_dna before this edit — passed in by the
  // caller (already holds the full row in memory) rather than re-fetched
  // here, purely so this function can detect a Hero Image change and flip
  // AI DNA to Needs Regeneration in the same write (Task 8). Omit either to
  // skip that check (e.g. price-only callers).
  currentPhotoUrl?: string | null
  currentAiDna?: AiDesignDna
}

export async function updateMasterDataOption(
  supabase: SupabaseClient,
  id: string,
  params: UpdateMasterDataOptionParams
): Promise<void> {
  const nextPhotoUrl = params.photo_url ?? null
  const heroImageChanged =
    params.currentAiDna !== undefined && nextPhotoUrl !== (params.currentPhotoUrl ?? null)
  const nextAiDna = params.currentAiDna
    ? heroImageChanged
      ? markDnaNeedsRegeneration(params.currentAiDna)
      : params.currentAiDna
    : undefined

  const { error } = await supabase
    .from('design_master_options')
    .update({
      name: params.name.trim(),
      metadata: params.metadata ?? {},
      photo_url: nextPhotoUrl,
      selling_points: params.selling_points ?? [],
      internal_notes: params.internal_notes ?? '',
      price: params.price ?? 0,
      ...(nextAiDna ? { ai_dna: nextAiDna } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}

// Quick-access "Update Harga" action (Fitter App sprint) — a lightweight
// single-column update so the price can be changed without opening the full
// Ubah form (Nama/Foto/Spesifikasi/Selling Point/Catatan untouched).
export async function updateMasterDataOptionPrice(
  supabase: SupabaseClient,
  id: string,
  price: number
): Promise<void> {
  const { error } = await supabase
    .from('design_master_options')
    .update({ price, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// Nonaktifkan — never a hard delete. Kept for two reasons per the brief:
// (1) history/Order lama must keep reading it, (2) it must stop being
// selectable on new Order. Nothing here needs to check for prior usage,
// since deactivating doesn't remove anything — see deleteMasterDataOption
// below for the (usage-gated) hard-delete path.
export async function deactivateMasterDataOption(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('design_master_options')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// Mirrors CATEGORY_BY_FIELD in design-studio/types.ts, inverted. Duplicated
// (rather than imported) so this lib doesn't reach up into components/ —
// keep the two in sync if Design Studio's field/category mapping ever
// changes. Bordir/Handmade Zig-Zag started as standalone catalogs with no
// DesignSelections field of their own, but the Design Specification
// Foundation sprint gave them one (embroidery/handmadeZigzag) — now mapped
// here too so the Hapus usage-guard covers them like every other category.
const DESIGN_FIELD_BY_CATEGORY: Partial<Record<MasterDataCategory, string>> = {
  model_thobe: 'model',
  look_cutting: 'lookCutting',
  bahan: 'fabric',
  warna_bahan: 'color',
  kerah: 'collar',
  manset: 'cuff',
  plaket: 'plaket',
  saku: 'pocket',
  aksesori: 'button',
  bordir: 'embroidery',
  handmade_zigzag: 'handmadeZigzag',
}

export const MASTER_DATA_IN_USE_MESSAGE =
  'Data ini sudah pernah digunakan sehingga tidak dapat dihapus. Silakan gunakan Nonaktifkan apabila sudah tidak digunakan.'

// RULE HAPUS — a Master Data item may only be hard-deleted if it has NEVER
// been used by real business data. Checked against:
// - Consultation: consultations.notes (the design selections are encoded
//   there as text, decoded and compared field-by-field — see notesCodec.ts)
// - Order: business_events (event_type='order.created', selections snapshot
//   at event_data.design.<field> — orders itself has no design columns,
//   the immutable snapshot lives on this event, see createOrder.ts)
// - In-progress Design Studio sessions not yet turned into an Order:
//   business_events (event_type in 'design.saved'/'design.completed',
//   event_data.<field> directly)
// - Production: has no separate check — Production only ever operates on
//   an already-created Order, so any option reachable by Production was
//   necessarily captured by the order.created snapshot above already;
//   Production's own tables (pattern_formulations, production_stage_records)
//   don't independently reference Master Data (confirmed: Formulasi Pola's
//   template field is its own enum, unrelated to Look Cutting master data).
export async function isMasterDataOptionInUse(
  supabase: SupabaseClient,
  option: Pick<MasterDataOption, 'category' | 'name'>
): Promise<boolean> {
  const field = DESIGN_FIELD_BY_CATEGORY[option.category]
  if (!field) return false

  const [orderEvents, designEvents, consultations] = await Promise.all([
    supabase
      .from('business_events')
      .select('id')
      .eq('event_type', 'order.created')
      .eq(`event_data->design->>${field}`, option.name)
      .limit(1),
    supabase
      .from('business_events')
      .select('id')
      .in('event_type', ['design.saved', 'design.completed'])
      .eq(`event_data->>${field}`, option.name)
      .limit(1),
    supabase.from('consultations').select('notes'),
  ])

  if (orderEvents.error) throw orderEvents.error
  if (designEvents.error) throw designEvents.error
  if (consultations.error) throw consultations.error

  if ((orderEvents.data?.length ?? 0) > 0) return true
  if ((designEvents.data?.length ?? 0) > 0) return true

  return (consultations.data ?? []).some(row => {
    const decoded = decodeDesignNotesField(row.notes, field)
    return decoded === option.name
  })
}

// Hard delete — only reachable once isMasterDataOptionInUse has confirmed
// this row was never referenced. Re-checked here (not just in the UI layer)
// so any future caller of this function gets the same guarantee.
export async function deleteMasterDataOption(supabase: SupabaseClient, option: MasterDataOption): Promise<void> {
  const inUse = await isMasterDataOptionInUse(supabase, option)
  if (inUse) throw new Error(MASTER_DATA_IN_USE_MESSAGE)

  const { error } = await supabase.from('design_master_options').delete().eq('id', option.id)
  if (error) throw error
}

// Small standalone reader for consultations.notes' `key=value|key=value`
// design block (see design-studio/notesCodec.ts) — duplicated instead of
// imported for the same reason as DESIGN_FIELD_BY_CATEGORY above (this lib
// doesn't reach into components/).
const NOTES_DESIGN_MARKER = '---LTOS_DESIGN_BLUEPRINT---'

function decodeDesignNotesField(raw: string | null, field: string): string | null {
  if (!raw || !raw.includes(NOTES_DESIGN_MARKER)) return null
  const block = raw.slice(raw.indexOf(NOTES_DESIGN_MARKER) + NOTES_DESIGN_MARKER.length).trim()
  for (const pair of block.split('|')) {
    const [key, value] = pair.split('=')
    if (key === field) return value ?? null
  }
  return null
}

// Urutan Tampil — swaps sort_order with the given option's immediate
// neighbor within the same category (simple up/down reordering, no
// drag-and-drop dependency needed).
export async function swapMasterDataOptionOrder(
  supabase: SupabaseClient,
  a: { id: string; sort_order: number },
  b: { id: string; sort_order: number }
): Promise<void> {
  const { error: errorA } = await supabase
    .from('design_master_options')
    .update({ sort_order: b.sort_order, updated_at: new Date().toISOString() })
    .eq('id', a.id)
  if (errorA) throw errorA

  const { error: errorB } = await supabase
    .from('design_master_options')
    .update({ sort_order: a.sort_order, updated_at: new Date().toISOString() })
    .eq('id', b.id)
  if (errorB) throw errorB
}

// Foto — same upload shape as Production's uploadEvidencePhoto (deterministic
// path + upsert + public URL), pointed at its own bucket since this is a
// distinct concern from production evidence.
export async function uploadMasterDataPhoto(
  supabase: SupabaseClient,
  params: { category: MasterDataCategory; id: string; file: File }
): Promise<string> {
  const ext = params.file.name.split('.').pop() || 'jpg'
  const path = `${params.category}/${params.id}.${ext}`

  const { error } = await supabase.storage
    .from('master-data-photos')
    .upload(path, params.file, { upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from('master-data-photos').getPublicUrl(path)
  return data.publicUrl
}
