import {
  FABRIC_CATEGORY_LABELS,
  FABRIC_DEFAULT_PAGE_SIZE,
  FABRIC_PRICE_TIER_LABELS,
  FABRIC_SEASON_LABELS,
  FABRIC_TEXTURE_LABELS,
  FABRIC_WEIGHT_CLASS_LABELS,
  isFabricCategory,
  isFabricPriceTier,
  isFabricSeason,
  isFabricSortOption,
  isFabricTexture,
  isFabricWeightClass,
  type FabricCategory,
  type ListMaterialsParams,
} from '@/types/material'

// Everything below reads/writes plain query-string state — no client JS,
// no router.push. Every filter/sort/chip/Load More control in the Fabric
// Explorer is a plain <Link>/<form> built from these functions, so
// selecting a filter is a real navigation to a real URL (shareable,
// refresh-safe, back-button-safe, zero client bundle cost) rather than
// client-side state that would need to duplicate the repository's
// filtering logic in the browser.

// Next.js passes page searchParams as this shape (string | string[] |
// undefined per key — string[] only when a key repeats in the URL, which
// this app never generates but a hand-edited URL could).
export type FabricSearchParams = { [key: string]: string | string[] | undefined }

const FILTER_KEYS = ['search', 'category', 'texture', 'weight', 'season', 'price_tier', 'sort'] as const
type FilterKey = (typeof FILTER_KEYS)[number]

function readParam(searchParams: FabricSearchParams, key: string): string | undefined {
  const value = searchParams[key]
  return Array.isArray(value) ? value[0] : value
}

// Parses raw URL search params into the repository's typed filter input.
// Unrecognized/invalid values for a given key are silently dropped (treated
// as "no filter") rather than throwing — a hand-edited or stale shared URL
// with a bad ?texture= should degrade to "show everything", not error out.
export function parseListMaterialsParams(
  searchParams: FabricSearchParams,
  opts: { lockedCategory?: FabricCategory } = {}
): ListMaterialsParams {
  const search = readParam(searchParams, 'search')?.trim()

  const rawCategory = readParam(searchParams, 'category')
  const category = opts.lockedCategory ?? (rawCategory && isFabricCategory(rawCategory) ? rawCategory : undefined)

  const rawTexture = readParam(searchParams, 'texture')
  const texture = rawTexture && isFabricTexture(rawTexture) ? rawTexture : undefined

  const rawWeight = readParam(searchParams, 'weight')
  const weightClass = rawWeight && isFabricWeightClass(rawWeight) ? rawWeight : undefined

  const rawSeason = readParam(searchParams, 'season')
  const season = rawSeason && isFabricSeason(rawSeason) ? rawSeason : undefined

  const rawPriceTier = readParam(searchParams, 'price_tier')
  const priceTier = rawPriceTier && isFabricPriceTier(rawPriceTier) ? rawPriceTier : undefined

  const rawSort = readParam(searchParams, 'sort')
  const sort = rawSort && isFabricSortOption(rawSort) ? rawSort : undefined

  const rawLimit = readParam(searchParams, 'limit')
  const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : NaN
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 500) : FABRIC_DEFAULT_PAGE_SIZE

  return { search: search || undefined, category, texture, weightClass, season, priceTier, sort, limit }
}

function currentParamsWithoutLimit(searchParams: FabricSearchParams): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of FILTER_KEYS) {
    const value = readParam(searchParams, key)
    if (value) params.set(key, value)
  }
  return params
}

function hrefFrom(basePath: string, params: URLSearchParams): string {
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

// Toggle behavior: selecting the already-active option for a dimension
// clears it (acts as a deselect), matching how the active filter chips'
// own "remove" link works. Any filter change resets pagination back to the
// default page size — staying on ?limit=48 after switching filters would
// either show far more than one "page" of the new result set, or (once a
// real offset scheme exists) point past the end of it.
export function buildToggleFilterHref(basePath: string, current: FabricSearchParams, key: Exclude<FilterKey, 'sort'>, value: string): string {
  const params = currentParamsWithoutLimit(current)
  if (params.get(key) === value) params.delete(key)
  else params.set(key, value)
  return hrefFrom(basePath, params)
}

export function buildSortHref(basePath: string, current: FabricSearchParams, sort: string): string {
  const params = currentParamsWithoutLimit(current)
  if (sort === 'featured') params.delete('sort')
  else params.set('sort', sort)
  return hrefFrom(basePath, params)
}

export function buildRemoveChipHref(basePath: string, current: FabricSearchParams, key: FilterKey): string {
  const params = currentParamsWithoutLimit(current)
  params.delete(key)
  return hrefFrom(basePath, params)
}

export function buildClearAllHref(basePath: string): string {
  return basePath
}

// Grows the visible grid by one page size, preserving every active filter
// — this is the whole "Load More" mechanism (§7): no offset, no client
// fetch, no accumulated client state. The URL itself is the pagination
// state, so refreshing or sharing a "loaded more" URL reproduces the same
// grid size.
export function buildLoadMoreHref(basePath: string, current: FabricSearchParams, currentLimit: number): string {
  const params = currentParamsWithoutLimit(current)
  params.set('limit', String(currentLimit + FABRIC_DEFAULT_PAGE_SIZE))
  return hrefFrom(basePath, params)
}

export interface ActiveFilterChip {
  key: FilterKey
  label: string
  removeHref: string
}

const CHIP_LABEL_MAPS: Partial<Record<FilterKey, Record<string, string>>> = {
  category: FABRIC_CATEGORY_LABELS,
  texture: FABRIC_TEXTURE_LABELS,
  weight: FABRIC_WEIGHT_CLASS_LABELS,
  season: FABRIC_SEASON_LABELS,
  price_tier: FABRIC_PRICE_TIER_LABELS,
}

// Chips for every active filter dimension, in a stable display order.
// `lockedCategory` (category landing pages) suppresses the category chip —
// it's implied by the URL path there, not a removable filter.
export function buildActiveFilterChips(basePath: string, current: FabricSearchParams, opts: { lockedCategory?: FabricCategory } = {}): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  const search = readParam(current, 'search')
  if (search) {
    chips.push({ key: 'search', label: `"${search}"`, removeHref: buildRemoveChipHref(basePath, current, 'search') })
  }

  for (const key of ['category', 'texture', 'weight', 'season', 'price_tier'] as const) {
    if (key === 'category' && opts.lockedCategory) continue
    const raw = readParam(current, key)
    const labels = CHIP_LABEL_MAPS[key]
    if (raw && labels?.[raw]) {
      chips.push({ key, label: labels[raw], removeHref: buildRemoveChipHref(basePath, current, key) })
    }
  }

  return chips
}
