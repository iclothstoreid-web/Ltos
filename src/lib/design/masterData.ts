import type { SupabaseClient } from '@supabase/supabase-js'
import type { AiDesignDna } from './aiDna/types'
import {
  DEFAULT_AI_DESIGN_DNA,
  LOOK_CUTTING_FIT_LOCK_RULES,
  LOOK_CUTTING_FIT_NEGATIVE_RULES,
} from './aiDna/types'
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
  // (see migration add_render_recipe_to_master_options). Editable via
  // RenderRecipeSection.tsx / updateMasterDataOption's `currentRenderRecipe`
  // param, mirroring how ai_dna is edited — see
  // src/lib/design/renderRecipe/types.ts.
  render_recipe: RenderRecipe
  // Optional link so Design Studio can join live stock/color by id instead
  // of matching on name (category 'bahan') — see src/lib/inventory/materials.ts.
  material_id: string | null
  // DNA Color Repository link (category 'warna_bahan' only) — this row is a
  // 1:1 render-pipeline mirror of a src/lib/design/dnaColors.ts row; the DNA
  // Color itself is the single source of truth for hex/prompt/etc, never
  // this row's own `metadata`. See src/lib/design/dnaColors.ts.
  dna_color_id: string | null
  // Sprint PR-05 (Master Data Integrity) — always present (DB column
  // default), only newly exposed on this type. Used as the optimistic-lock
  // comparison value in updateMasterDataOption: a save whose `original.
  // updated_at` no longer matches the row's real value (because another
  // session saved in between) is refused rather than silently overwriting
  // whatever that other session wrote — see StaleMasterDataError.
  updated_at: string
  // Component Default Knowledge — Collar (locked brief, 2026-08-05).
  // 'kerah' items only — decides which category-level Component Default
  // Knowledge (COLLAR_DEFAULT_1 one_piece / COLLAR_DEFAULT_2 two_piece, see
  // componentDefaultKnowledge/collar.ts) the Render Assembly injects.
  // Engine-only: never shown to the customer, never used for Design Studio
  // selection. Nullable — an unset Kerah item just gets no Collar Component
  // Default Knowledge injected (see collar.ts's getCollarDefaultKnowledge).
  construction_type: 'one_piece' | 'two_piece' | null
}

export type MasterOptionsByCategory = Record<MasterDataCategory, MasterDataOption[]>

// Reserved 'bahan' (Material) metadata keys for the dedicated Supplier /
// Karakteristik fields — kept inside the existing flexible `metadata` jsonb
// column rather than a new DB column, so Repository Architecture stays
// untouched. Color linkage moved off `metadata` entirely (Architecture Lock:
// DNA Color Repository + Material Color Mapping) — a 'bahan' item now points
// at a real `materials` row via `material_id`, and that Material's available
// colors + supplier codes live in the `material_colors` bridge table (see
// src/lib/design/materialColors.ts), never a comma-joined name list here.
export const MATERIAL_SUPPLIER_KEY = 'supplier'
export const MATERIAL_KARAKTERISTIK_KEY = 'karakteristik'
// 'warna' is a pre-Material-Colors leftover key (free-text comma list, e.g.
// "Black,Navy") some rows still carry in metadata from before the
// material_colors bridge table existed. Reserved (never rendered, never
// re-written) rather than actively supported — see the SQL cleanup in
// migration 20260824000000_drop_materials_default_color.sql for the one row
// that had it.
export const MATERIAL_LEGACY_WARNA_KEY = 'warna'
export const MATERIAL_RESERVED_METADATA_KEYS: readonly string[] = [
  MATERIAL_SUPPLIER_KEY,
  MATERIAL_KARAKTERISTIK_KEY,
  MATERIAL_LEGACY_WARNA_KEY,
]

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

  // Look Cutting Fit Knowledge is layered in here, explicitly, only for
  // 'look_cutting' — see aiDna/types.ts's LOOK_CUTTING_FIT_LOCK_RULES/
  // _NEGATIVE_RULES. Every other category (including model_thobe, since the
  // Architecture Lock revision, 2026-08-04) leaves `ai_dna` unset and gets
  // the plain DB column default — model_thobe no longer gets a Quality
  // Foundation extension here; that content now lives in
  // DEFAULT_GLOBAL_RENDER_POLICY (recipeComposer/types.ts), applied to every
  // render regardless of which Model Thobe is selected. Delta Knowledge
  // decision (2026-08-04) — DEFAULT_AI_DESIGN_DNA.lockRules/negativeRules
  // are now `[]` (Identity Knowledge lives only in Recipe Composer's Engine
  // merge, see composer.ts), so spreading it below already produces a
  // delta-only array (just the category extension) with no logic change
  // needed here.
  const ai_dna: AiDesignDna | undefined =
    params.category === 'look_cutting'
      ? {
          ...DEFAULT_AI_DESIGN_DNA,
          lockRules: [...DEFAULT_AI_DESIGN_DNA.lockRules, ...LOOK_CUTTING_FIT_LOCK_RULES],
          negativeRules: [...DEFAULT_AI_DESIGN_DNA.negativeRules, ...LOOK_CUTTING_FIT_NEGATIVE_RULES],
        }
      : undefined

  const { error } = await supabase.from('design_master_options').insert({
    category: params.category,
    name: params.name.trim(),
    metadata: params.metadata ?? {},
    price: params.price ?? 0,
    sort_order: (existing?.sort_order ?? 0) + 1,
    ...(ai_dna ? { ai_dna } : {}),
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
  // Component Hero Image = Catalog Photo (Architecture Lock, 2026-08-04) —
  // `photo_url` (catalog thumbnail) IS the source AiDesignDnaSection's
  // Activate action freezes into `ai_dna.metadata.sourceImage`; there is no
  // second upload anymore. The old Task 8 "photo_url changed -> flip ai_dna
  // to Needs Review" coupling (and its `currentPhotoUrl` param) is still
  // gone — `currentAiDna` below is only ever written when it actually
  // differs from `original.ai_dna` (see `patch` below), same Safe Save
  // treatment as every other field. A catalog photo change does not
  // auto-refresh an already-approved `sourceImage`; the owner re-activates
  // explicitly (same snapshot-on-demand semantics as before).
  currentAiDna?: AiDesignDna
  // Render Recipe editor (Reference-First Cleanup) — same Safe Save
  // treatment as `currentAiDna` above: diffed against `original.render_recipe`
  // and only sent if changed. Omit to leave Render Recipe untouched (e.g. a
  // price-only or AI-DNA-only caller).
  currentRenderRecipe?: RenderRecipe
  // 'bahan' items only — links this catalog entry to a real Inventory
  // `materials` row (Architecture Lock: DNA Color Repository + Material
  // Color Mapping). Omit to leave unchanged.
  material_id?: string | null
  // 'kerah' items only — see MasterDataOption.construction_type. Omit to
  // leave unchanged.
  construction_type?: 'one_piece' | 'two_piece' | null
  // Sprint PR-05 (Master Data Integrity — Lost Update fix) — the full row
  // exactly as it was read when this edit session opened (MasterDataManager's
  // startEdit). Two things depend on it:
  //   1. Safe Save (Phase 2): every field above is compared against its
  //      `original` counterpart; anything unchanged is never sent to the
  //      database, so an edit session that never touched AI Design DNA (a
  //      price-only change, say) can no longer resend its stale in-memory
  //      `ai_dna` snapshot and overwrite whatever the database actually
  //      holds now.
  //   2. Optimistic Lock (Phase 3): `original.updated_at` is used as a
  //      WHERE-clause guard — if another session already saved this row in
  //      between, the write matches zero rows and this function throws
  //      StaleMasterDataError instead of silently clobbering that other
  //      session's save.
  // This is the direct fix for the 2026-07-30 incident where a stale
  // Master Data Editor tab overwrote Saudi Modern's authorized AI Design
  // DNA (version 2, fully populated) back down to version 1 with four
  // required fields null, which then BLOCKED render at the Capability
  // Engine gate.
  original: MasterDataOption
}

// Phase 3 (Sprint PR-05) — thrown when the optimistic-lock WHERE clause
// (id + original.updated_at) matches zero rows, meaning some other session
// saved this item after the current edit session opened it. The message is
// shown to the user as-is (MasterDataManager's catch blocks already surface
// `err.message` directly).
export class StaleMasterDataError extends Error {
  constructor() {
    super('Data telah berubah karena diedit dari sesi lain. Muat ulang halaman sebelum menyimpan.')
    this.name = 'StaleMasterDataError'
  }
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export async function updateMasterDataOption(
  supabase: SupabaseClient,
  id: string,
  params: UpdateMasterDataOptionParams
): Promise<void> {
  const { original } = params
  const nextPhotoUrl = params.photo_url ?? null
  const nextAiDna = params.currentAiDna

  const nextName = params.name.trim()
  const nextMetadata = params.metadata ?? {}
  const nextSellingPoints = params.selling_points ?? []
  const nextInternalNotes = params.internal_notes ?? ''
  const nextPrice = params.price ?? 0

  // Safe Save (Phase 2) — build the UPDATE payload from ONLY the fields
  // that genuinely differ from `original`. A field never touched during
  // this edit session is never re-sent, however "current" its value looks
  // in local component state.
  const patch: Record<string, unknown> = {}
  if (nextName !== original.name) patch.name = nextName
  if (!sameJson(nextMetadata, original.metadata)) patch.metadata = nextMetadata
  if (nextPhotoUrl !== original.photo_url) patch.photo_url = nextPhotoUrl
  if (!sameJson(nextSellingPoints, original.selling_points)) patch.selling_points = nextSellingPoints
  if (nextInternalNotes !== original.internal_notes) patch.internal_notes = nextInternalNotes
  if (nextPrice !== original.price) patch.price = nextPrice
  if (params.material_id !== undefined && params.material_id !== original.material_id) {
    patch.material_id = params.material_id
  }
  if (params.construction_type !== undefined && params.construction_type !== original.construction_type) {
    patch.construction_type = params.construction_type
  }
  if (nextAiDna && !sameJson(nextAiDna, original.ai_dna)) patch.ai_dna = nextAiDna
  if (params.currentRenderRecipe && !sameJson(params.currentRenderRecipe, original.render_recipe)) {
    patch.render_recipe = params.currentRenderRecipe
  }

  if (Object.keys(patch).length === 0) {
    // Nothing actually changed since the edit session opened — no write,
    // so there is nothing an optimistic-lock conflict could even mean here.
    return
  }

  patch.updated_at = new Date().toISOString()

  // Optimistic Lock (Phase 3) — `.eq('updated_at', original.updated_at)`
  // means this UPDATE only takes effect if the row is still exactly as
  // this edit session last saw it. `.select('id')` is what makes a
  // zero-row match observable (Supabase does not error on a WHERE clause
  // that matches nothing; it just returns an empty array).
  const { data, error } = await supabase
    .from('design_master_options')
    .update(patch)
    .eq('id', id)
    .eq('updated_at', original.updated_at)
    .select('id')

  if (error) throw error
  if (!data || data.length === 0) {
    throw new StaleMasterDataError()
  }
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

/**
 * Get repository category from design specification field name.
 * Inverse lookup: field (e.g. 'collar') → category (e.g. 'kerah')
 *
 * Used by RenderService to convert DesignSpecification keys to API payload componentTypes.
 * Single source of truth: DESIGN_FIELD_BY_CATEGORY above.
 */
export function getCategoryByDesignField(field: string): MasterDataCategory | null {
  for (const [category, designField] of Object.entries(DESIGN_FIELD_BY_CATEGORY)) {
    if (designField === field) {
      return category as MasterDataCategory
    }
  }
  return null
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
// distinct concern from production evidence. Uploads the catalog thumbnail
// only — the `variant: 'hero'` second-path capability this function used to
// carry (a dedicated internal Render Engine reference photo, independent of
// the catalog thumbnail) was removed with it: Component Hero Image = Catalog
// Photo now (Architecture Lock, 2026-08-04), so there is no second image to
// upload anymore. AiDesignDnaSection's Activate action reuses the URL this
// function already returns.
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
