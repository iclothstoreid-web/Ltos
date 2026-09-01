import type { SupabaseClient } from '@supabase/supabase-js'
import type { DesignSelections } from '@/components/workspace/design-studio/types'

// ============================================================================
// Design Look — a curated visual PRESET (a whole-garment inspiration), NOT a
// new base model. Stored as `category = 'design_look'` rows in
// design_master_options (single source of truth shared by Fitter App and the
// public configurator — same table both already read). A Look carries a
// photo, a customer-facing tagline/description, and a mapping of the design
// components that can actually be PROVEN from its reference image.
//
// Picking a Look only pre-fills the components it actually knows — every
// other pilihan stays exactly as the fitter/customer left it, and every
// pre-filled one is still freely changeable afterwards. A Look never locks
// the design.
//
// The component mapping lives in the row's `metadata` jsonb under flat
// `look_*` keys (readable in the existing Master Data key=value editor):
//   look_model, look_lookCutting, look_fabric, look_color, look_collar,
//   look_cuff, look_plaket, look_pocket, look_button, look_embroidery,
//   look_zigzag        -> value is the master-data option NAME
//   tagline            -> one-line card subtitle
//   featured           -> "true" to surface in the homepage teaser
// selling_points[0] is the 1–3 sentence description; [1..3] are bullet points.
// ============================================================================

// Which DesignSelections fields a Look is allowed to pre-fill. `lookCutting`
// and `button` only exist in the Fitter selection model (the public
// configurator has no field for them) — applyLookToConfig below simply skips
// anything the public catalog can't resolve.
export const DESIGN_LOOK_COMPONENT_FIELDS = [
  'model',
  'lookCutting',
  'fabric',
  'color',
  'collar',
  'cuff',
  'plaket',
  'pocket',
  'button',
  'embroidery',
  'handmadeZigzag',
] as const

export type DesignLookComponentField = (typeof DESIGN_LOOK_COMPONENT_FIELDS)[number]

// metadata key for a component field, e.g. 'color' -> 'look_color'.
export function designLookMetaKey(field: DesignLookComponentField): string {
  return `look_${field}`
}

export interface DesignLook {
  id: string
  name: string
  tagline: string | null
  description: string | null
  sellingPoints: string[]
  photoUrl: string | null
  featured: boolean
  sortOrder: number
  // Only the components provable from the reference image — never invented.
  components: Partial<Record<DesignLookComponentField, string>>
}

// The raw row shape returned by both fetch paths (RPC for anon, table for
// staff). Deliberately loose — only the fields parseDesignLook reads.
interface DesignLookRow {
  id: string
  name: string
  photo_url: string | null
  selling_points: unknown
  sort_order: number | null
  metadata: Record<string, string> | null
}

export function parseDesignLook(row: DesignLookRow): DesignLook {
  const metadata = row.metadata ?? {}
  const points = Array.isArray(row.selling_points)
    ? (row.selling_points as unknown[]).filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    : []

  const components: Partial<Record<DesignLookComponentField, string>> = {}
  for (const field of DESIGN_LOOK_COMPONENT_FIELDS) {
    const value = metadata[designLookMetaKey(field)]
    if (typeof value === 'string' && value.trim().length > 0) {
      components[field] = value.trim()
    }
  }

  return {
    id: row.id,
    name: row.name,
    tagline: metadata.tagline?.trim() || null,
    description: points[0] ?? null,
    sellingPoints: points.slice(1, 4),
    photoUrl: row.photo_url,
    featured: metadata.featured === 'true',
    sortOrder: row.sort_order ?? 0,
    components,
  }
}

// ── Fitter App: apply a Look onto the name-keyed DesignSelections ────────────
// Every known component name is written straight in; unknown fields are left
// untouched. The fitter can still change any of them afterwards.
export function applyLookToSelections(look: DesignLook, current: DesignSelections): DesignSelections {
  const next = { ...current }
  for (const [field, value] of Object.entries(look.components) as [DesignLookComponentField, string][]) {
    if (value) next[field as keyof DesignSelections] = value
  }
  return next
}

// Human-readable "this Look will set: Warna Putih Clean, Plaket Badr Plaket"
// summary — used by both the Fitter card and the public gallery card so the
// customer knows what a pick actually does before committing.
const FIELD_LABELS: Record<DesignLookComponentField, string> = {
  model: 'Model',
  lookCutting: 'Potongan',
  fabric: 'Material',
  color: 'Warna',
  collar: 'Kerah',
  cuff: 'Manset',
  plaket: 'Plaket',
  pocket: 'Saku',
  button: 'Kancing',
  embroidery: 'Bordir',
  handmadeZigzag: 'Handmade Zig-Zag',
}

export function describeLookComponents(look: DesignLook): string[] {
  return (Object.entries(look.components) as [DesignLookComponentField, string][])
    .filter(([, value]) => !!value)
    .map(([field, value]) => `${FIELD_LABELS[field]}: ${value}`)
}

// ── Public configurator: resolve a Look's component NAMES to option IDs ──────
// `catalog` is the ConfiguratorCatalog already loaded client-side. Any field
// the public configurator has no slot for (lookCutting, button) or that
// doesn't resolve to a live option is skipped — never guessed.
import type { ConfiguratorField, ConfiguratorOptionsByField } from '@/types/configurator'
import type { DesignConfig } from '@/types/configurator'

const FIELD_TO_CONFIG: Partial<
  Record<DesignLookComponentField, { configKey: keyof DesignConfig; catalogField: ConfiguratorField }>
> = {
  model: { configKey: 'modelId', catalogField: 'modelId' },
  fabric: { configKey: 'fabricId', catalogField: 'fabricId' },
  color: { configKey: 'colorId', catalogField: 'colorId' },
  collar: { configKey: 'collarId', catalogField: 'collarId' },
  cuff: { configKey: 'cuffId', catalogField: 'cuffId' },
  plaket: { configKey: 'placketId', catalogField: 'placketId' },
  pocket: { configKey: 'pocketId', catalogField: 'pocketId' },
  embroidery: { configKey: 'embroidery', catalogField: 'embroidery' },
  handmadeZigzag: { configKey: 'zigzagId', catalogField: 'zigzagId' },
}

export function applyLookToConfig(
  look: DesignLook,
  catalogFields: ConfiguratorOptionsByField
): Partial<DesignConfig> {
  const patch: Partial<DesignConfig> = {}
  for (const [field, name] of Object.entries(look.components) as [DesignLookComponentField, string][]) {
    const map = FIELD_TO_CONFIG[field]
    if (!map || !name) continue
    const option = catalogFields[map.catalogField]?.find((o) => o.name === name)
    if (option) {
      // both sides are string ids on DesignConfig
      ;(patch as Record<string, string>)[map.configKey] = option.id
    }
  }
  return patch
}

// True while the live config still equals what this Look set — i.e. the
// visitor hasn't overridden any of the Look's pre-filled pilihan yet. Drives
// the "Dipilih" highlight without any effect/subscription bookkeeping.
export function lookMatchesConfig(
  look: DesignLook,
  catalogFields: ConfiguratorOptionsByField,
  config: DesignConfig
): boolean {
  const patch = applyLookToConfig(look, catalogFields)
  const keys = Object.keys(patch) as (keyof DesignConfig)[]
  if (keys.length === 0) return false
  return keys.every((k) => config[k] === patch[k])
}

// ── Fetch (staff: table read; anon: SECURITY DEFINER RPC) ───────────────────

// Staff path — the Fitter page already loads every category via
// fetchActiveMasterOptions(); this just reshapes masterOptions.design_look.
export function designLooksFromMasterOptions(rows: DesignLookRow[]): DesignLook[] {
  return rows
    .map(parseDesignLook)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

// Anon path — public configurator + homepage. Uses list_active_design_looks(),
// a SECURITY DEFINER function with a hard column allowlist (design_master_options
// itself is staff-only RLS and carries internal columns; see the migration).
export async function fetchActiveDesignLooks(supabase: SupabaseClient): Promise<DesignLook[]> {
  const { data, error } = await supabase.rpc('list_active_design_looks')
  if (error) throw error
  return designLooksFromMasterOptions((data ?? []) as DesignLookRow[])
}
