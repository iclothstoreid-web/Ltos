import type { SupabaseClient } from '@supabase/supabase-js'
import type { ServiceLevel } from '@/lib/order/service'
import type { DesignConfig, Estimate, EstimateLine } from '@/types/configurator'
import { getConfiguratorCatalog, findOption, type ConfiguratorCatalog } from './mapping'
import { computeEta, SERVICE_LEVEL_LABELS } from './eta'

// Placeholder rush surcharge — NOT sourced from the real Commercial Engine
// (grepped the codebase; no existing service-level pricing rule exists to
// reuse). Applied to `subtotal` as a flat percentage. Swap
// SERVICE_SURCHARGE_RATE (or the whole priceBreakdown body) for a real
// Commercial Engine call later — see the ENGINE SEAM note on
// computeEstimate below.
const SERVICE_SURCHARGE_RATE: Record<ServiceLevel, number> = {
  standard: 0,
  fast: 0.15,
  very_fast: 0.35,
}

function priceBreakdown(
  config: DesignConfig,
  serviceLevel: ServiceLevel,
  catalog: ConfiguratorCatalog
): { breakdown: EstimateLine[]; subtotal: number; serviceSurcharge: number; total: number } {
  const breakdown: EstimateLine[] = []

  const model = findOption(catalog.fields.modelId, config.modelId)
  if (model) breakdown.push({ kind: 'base', label: model.name, amount: model.price, optionId: model.id })

  const fabric = findOption(catalog.fields.fabricId, config.fabricId)
  if (fabric) breakdown.push({ kind: 'fabric', label: fabric.name, amount: fabric.price, optionId: fabric.id })

  const color = findOption(catalog.fields.colorId, config.colorId)
  if (color) breakdown.push({ kind: 'fabric', label: color.name, amount: color.price, optionId: color.id })

  const collar = findOption(catalog.fields.collarId, config.collarId)
  if (collar) breakdown.push({ kind: 'collar', label: collar.name, amount: collar.price, optionId: collar.id })

  const cuff = findOption(catalog.fields.cuffId, config.cuffId)
  if (cuff) breakdown.push({ kind: 'cuff', label: cuff.name, amount: cuff.price, optionId: cuff.id })

  // Saku / Plaket / Handmade Zig-Zag — same pattern: whatever `price` the
  // Master Data row carries (0 for Saku/Plaket today, a real delta for
  // Handmade Zig-Zag). No invented pricing.
  const pocket = findOption(catalog.fields.pocketId, config.pocketId)
  if (pocket) breakdown.push({ kind: 'pocket', label: pocket.name, amount: pocket.price, optionId: pocket.id })

  const placket = findOption(catalog.fields.placketId, config.placketId)
  if (placket) breakdown.push({ kind: 'placket', label: placket.name, amount: placket.price, optionId: placket.id })

  const zigzag = findOption(catalog.fields.zigzagId, config.zigzagId)
  if (zigzag) breakdown.push({ kind: 'zigzag', label: zigzag.name, amount: zigzag.price, optionId: zigzag.id })

  const embroidery = findOption(catalog.fields.embroidery, config.embroidery)
  if (embroidery) breakdown.push({ kind: 'embroidery', label: embroidery.name, amount: embroidery.price, optionId: embroidery.id })

  for (const accessoryId of config.accessories) {
    const accessory = findOption(catalog.accessories, accessoryId)
    if (accessory) breakdown.push({ kind: 'accessories', label: accessory.name, amount: accessory.price, optionId: accessory.id })
  }

  const subtotal = breakdown.reduce((sum, line) => sum + line.amount, 0)
  const serviceSurcharge = Math.round(subtotal * SERVICE_SURCHARGE_RATE[serviceLevel])
  if (serviceSurcharge > 0) {
    breakdown.push({ kind: 'service', label: `Layanan ${SERVICE_LEVEL_LABELS[serviceLevel]}`, amount: serviceSurcharge })
  }

  return { breakdown, subtotal, serviceSurcharge, total: subtotal + serviceSurcharge }
}

// Pure — no I/O, no Supabase. This is the seam: a production Commercial
// Engine integration swaps this function's body (and/or priceBreakdown's)
// for a real pricing call; getEstimate below and every caller of it stay
// unchanged since the signature and Estimate return shape don't move.
export function computeEstimate(config: DesignConfig, serviceLevel: ServiceLevel, catalog: ConfiguratorCatalog): Estimate {
  const { breakdown, subtotal, serviceSurcharge, total } = priceBreakdown(config, serviceLevel, catalog)
  const eta = computeEta(serviceLevel)

  return {
    status: 'ready',
    breakdown,
    subtotal,
    serviceLevel,
    serviceSurcharge,
    total,
    currency: 'IDR',
    productionDays: eta.productionDays,
    completionDate: eta.completionDateIso,
    completionDateFormatted: eta.completionDateFormatted,
    updatedAt: new Date().toISOString(),
  }
}

export function hashEstimateInput(config: DesignConfig, serviceLevel: ServiceLevel): string {
  return JSON.stringify({
    m: config.modelId,
    c: config.collarId,
    cu: config.cuffId,
    f: config.fabricId,
    co: config.colorId,
    sk: config.pocketId,
    pl: config.placketId,
    hz: config.zigzagId,
    e: config.embroidery,
    a: [...config.accessories].sort(),
    s: serviceLevel,
  })
}

// Module-scope caches — best-effort only (a serverless invocation may get a
// cold instance with empty caches; this is a perf optimization, not a
// correctness dependency). Two layers: the catalog fetch (the actual slow
// part — a Supabase round trip) and the computed Estimate itself, both
// short-TTL since Master Data can change underneath.
const CATALOG_CACHE_TTL_MS = 30_000
const ESTIMATE_CACHE_TTL_MS = 30_000

let catalogCache: { value: ConfiguratorCatalog; expiresAt: number } | null = null
let catalogInFlight: Promise<ConfiguratorCatalog> | null = null

async function getCachedCatalog(supabase: SupabaseClient): Promise<ConfiguratorCatalog> {
  const now = Date.now()
  if (catalogCache && catalogCache.expiresAt > now) return catalogCache.value
  if (catalogInFlight) return catalogInFlight

  catalogInFlight = getConfiguratorCatalog(supabase)
    .then((catalog) => {
      catalogCache = { value: catalog, expiresAt: Date.now() + CATALOG_CACHE_TTL_MS }
      return catalog
    })
    .finally(() => {
      catalogInFlight = null
    })

  return catalogInFlight
}

const resultCache = new Map<string, { value: Estimate; expiresAt: number }>()
const resultInFlight = new Map<string, Promise<Estimate>>()

// The only export the route calls. Handles catalog fetch (via the mapping
// integration layer — never a direct table query), caching, and request
// dedup for identical concurrent (config, serviceLevel) pairs.
export async function getEstimate(
  supabase: SupabaseClient,
  config: DesignConfig,
  serviceLevel: ServiceLevel
): Promise<Estimate> {
  const key = hashEstimateInput(config, serviceLevel)
  const now = Date.now()

  const cached = resultCache.get(key)
  if (cached && cached.expiresAt > now) return cached.value

  const pending = resultInFlight.get(key)
  if (pending) return pending

  const promise = getCachedCatalog(supabase)
    .then((catalog) => {
      const estimate = computeEstimate(config, serviceLevel, catalog)
      resultCache.set(key, { value: estimate, expiresAt: Date.now() + ESTIMATE_CACHE_TTL_MS })
      return estimate
    })
    .finally(() => {
      resultInFlight.delete(key)
    })

  resultInFlight.set(key, promise)
  return promise
}
