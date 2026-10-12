import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AiSalesStage } from './types'

export type AiSalesMediaCategory =
  | 'model'
  | 'model_detail'
  | 'fabric'
  | 'color_reference'
  | 'collar'
  | 'cufflink'
  | 'placket'
  | 'pocket'
  | 'cutting'
  | 'zigzag'
  | 'kabak'
  | 'other'

export interface AiSalesMediaAsset {
  assetKey: string
  category: AiSalesMediaCategory
  title: string
  imageUrl: string
  caption: string
  tags: string[]
  triggerTerms: string[]
  modelFamily: string | null
  fabricName: string | null
  colorName: string | null
  partName: string | null
  isStarter: boolean
  starterRank: number | null
  priority: number
  sourceFolder: string | null
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function isBroadInfoRequest(text: string): boolean {
  return /(minta|mohon|boleh|bisa).*info.*(custom|thobe|jubah)|(info|informasi).*(custom|thobe|jubah)|(custom|thobe|jubah).*info/i.test(
    text
  )
}

export function isAiSalesVisualRequest(text: string): boolean {
  return /(foto|photo|gambar|contoh|visual|lihat|liat|tunjuk|kirim.*(model|bahan|kain|warna|kerah|saku|manset|plaket)|(?:bahan|kain|warna|model|kerah|saku|manset|plaket)\s+(?:lain|beda)|pilihan\s+(?:model|kerah|saku|manset|plaket)|referensi\s+(?:model|warna|bahan)|warna\s+(?:navy|charcoal|putih|hitam|hijau|green|coklat|maroon)|bahan\s+(?:basic|premium|wool|wol|cashmere|twill))/i.test(
    text
  )
}

function wantsMultipleVisuals(text: string): boolean {
  return /(beberapa|pilihan|referensi|contoh.{0,18}(?:foto|gambar|model|kerah|saku|manset|plaket)|(?:foto|gambar).{0,18}(?:beberapa|pilihan|referensi))/i.test(
    text
  )
}

function detectedCategories(text: string): AiSalesMediaCategory[] {
  const categories: AiSalesMediaCategory[] = []

  const add = (category: AiSalesMediaCategory, pattern: RegExp) => {
    if (pattern.test(text) && !categories.includes(category)) categories.push(category)
  }

  add('model_detail', /(detail.*model|model.*detail|detail jahit|jahitan)/i)
  add('collar', /(kerah|collar)/i)
  add('cufflink', /(manset|cuff\s*link|cufflink|cuff)/i)
  add('placket', /(plaket|placket)/i)
  add('pocket', /(saku|pocket)/i)
  add('cutting', /(cutting|slim\s*fit|semi\s*slim|regular\s*fit|standard\s*fit)/i)
  add('zigzag', /(zig\s*-?\s*zag|handmade)/i)
  add('kabak', /\bkabak\b/i)
  add('fabric', /(bahan|kain|fabric|wool|wol|cashmere|twill)/i)
  add('color_reference', /(warna|colour|color|navy|charcoal|putih|hitam|hijau|green|coklat|maroon)/i)
  add('model', /(model|thobe|jubah|saudi|qatary|qatar|emirates|dubai|kandora)/i)

  return categories
}

function lexicalScore(asset: AiSalesMediaAsset, text: string): number {
  const haystack = normalize(text)
  let score = 0

  for (const term of asset.triggerTerms) {
    const normalized = normalize(term)
    if (normalized && haystack.includes(normalized)) score += 24
  }

  for (const tag of asset.tags) {
    const normalized = normalize(tag)
    if (normalized && haystack.includes(normalized)) score += 12
  }

  for (const value of [asset.modelFamily, asset.fabricName, asset.colorName, asset.partName, asset.title]) {
    const normalized = value ? normalize(value) : ''
    if (normalized && haystack.includes(normalized)) score += 18
  }

  return score
}

function starterPack(assets: AiSalesMediaAsset[], customerText: string): AiSalesMediaAsset[] {
  return assets
    .filter(asset => asset.isStarter && normalize(asset.sourceFolder ?? '') === 'kirim pertama')
    .sort(
      (a, b) =>
        lexicalScore(b, customerText) - lexicalScore(a, customerText) ||
        (a.starterRank ?? 99) - (b.starterRank ?? 99) ||
        b.priority - a.priority
    )
    .slice(0, 3)
}

function modelMatches(asset: AiSalesMediaAsset, desiredModel: string): boolean {
  if (!desiredModel) return true
  const actual = normalize(asset.modelFamily ?? '')
  if (!actual) return false
  if (actual === desiredModel) return true
  if (desiredModel === 'emirates dubai') return actual.includes('emirates') || actual.includes('dubai')
  return actual.includes(desiredModel) || desiredModel.includes(actual)
}

function colorMatches(asset: AiSalesMediaAsset, desiredColors: string[]): boolean {
  if (!desiredColors.length || !asset.colorName) return true
  const actual = normalize(asset.colorName)
  return desiredColors.some(color => {
    const wanted = normalize(color)
    if (actual === wanted) return true
    if (wanted === 'putih') return actual === 'white' || actual.includes('white')
    if (wanted === 'hitam') return actual === 'black' || actual.includes('black')
    if (wanted === 'hijau') return actual === 'green' || actual.includes('hijau') || actual.includes('green')
    if (wanted === 'abu') return actual.includes('grey') || actual.includes('gray') || actual.includes('charcoal')
    return actual.includes(wanted) || wanted.includes(actual)
  })
}

function pickByCategory(
  assets: AiSalesMediaAsset[],
  category: AiSalesMediaCategory,
  customerText: string,
  params: { desiredModel: string; desiredColors: string[]; requestedFabric: string },
  count: number
): AiSalesMediaAsset[] {
  return assets
    .filter(asset => asset.category === category)
    .filter(asset => category !== 'model' || modelMatches(asset, params.desiredModel))
    .filter(asset => category !== 'fabric' || !params.requestedFabric || normalize(asset.fabricName ?? '') === params.requestedFabric)
    .filter(asset => colorMatches(asset, params.desiredColors))
    .map(asset => ({
      asset,
      score:
        lexicalScore(asset, customerText) +
        asset.priority +
        (params.desiredModel && modelMatches(asset, params.desiredModel) ? 25 : 0) +
        (params.desiredColors.length && asset.colorName && colorMatches(asset, params.desiredColors) ? 20 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.asset.assetKey.localeCompare(b.asset.assetKey))
    .slice(0, count)
    .map(item => item.asset)
}

export async function selectAiSalesMediaAssets(
  supabase: SupabaseClient,
  params: {
    customerText: string
    currentStage: AiSalesStage
    sentAssetKeys?: string[]
    lead?: Record<string, unknown>
  }
): Promise<AiSalesMediaAsset[]> {
  const { data, error } = await supabase
    .from('ai_sales_media_assets')
    .select(
      'asset_key, category, title, image_url, caption, tags, trigger_terms, model_family, fabric_name, color_name, part_name, is_starter, starter_rank, priority, source_folder'
    )
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(220)

  if (error) throw error

  const assets = ((data ?? []) as Array<Record<string, unknown>>)
    .map(row => ({
      assetKey: String(row.asset_key ?? ''),
      category: String(row.category ?? 'other') as AiSalesMediaCategory,
      title: String(row.title ?? ''),
      imageUrl: String(row.image_url ?? ''),
      caption: String(row.caption ?? ''),
      tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
      triggerTerms: Array.isArray(row.trigger_terms) ? row.trigger_terms.map(String) : [],
      modelFamily: row.model_family ? String(row.model_family) : null,
      fabricName: row.fabric_name ? String(row.fabric_name) : null,
      colorName: row.color_name ? String(row.color_name) : null,
      partName: row.part_name ? String(row.part_name) : null,
      isStarter: row.is_starter === true,
      starterRank: typeof row.starter_rank === 'number' ? row.starter_rank : null,
      priority: Number(row.priority ?? 50),
      sourceFolder: row.source_folder ? String(row.source_folder) : null,
    }))
    .filter(asset =>
      asset.assetKey &&
      /^https?:\/\//i.test(asset.imageUrl) &&
      !params.sentAssetKeys?.includes(asset.assetKey)
    )

  if (!assets.length) return []

  const customerText = params.customerText.trim()
  const normalizedText = normalize(customerText)
  const asksDifferentModel = /(?:model|potongan)\s+(?:lain|beda)/i.test(customerText)
  const asksDifferentFabric = /(?:bahan|kain)\s+(?:lain|beda)/i.test(customerText)
  const asksDifferentColor = /(?:warna|colour|color)\s+(?:lain|beda)/i.test(customerText)

  if (params.currentStage === 'new' && !params.sentAssetKeys?.length && isBroadInfoRequest(customerText) &&
      !/(?:bahan|kain|warna|colour|color|model)\s+(?:lain|beda)/i.test(customerText) &&
      !/(saudi|qatary|qatar|emirates|dubai|navy|charcoal|putih|hitam|hijau|coklat|maroon|basic|premium|wool|wol|cashmere|twill)/i.test(customerText)) {
    return starterPack(assets, customerText)
  }

  if (!isAiSalesVisualRequest(customerText)) return []

  // Women's garment visuals are not currently verified in the Local Tailor media library.
  // Returning [] lets the service hand the request to a human instead of hallucinating.
  if (/(abaya|gamis\s*(?:wanita|akhwat)|dress\s*wanita|baju\s*wanita|women'?s?)/i.test(customerText)) {
    return []
  }

  const leadModel = typeof params.lead?.model === 'string' ? normalize(params.lead.model) : ''
  const mentionedModels = [
    ['saudi', /\bsaudi\b/i],
    ['qatary', /\b(?:qatary|qatar)\b/i],
    ['emirates dubai', /\b(?:emirates|dubai|kandora)\b/i],
  ] as const
  const desiredModel = mentionedModels.find(([, pattern]) => pattern.test(customerText))?.[0] ?? leadModel

  const desiredColors = [
    ['white', /\b(?:white|putih|clear white|broken white)\b/i],
    ['black', /\b(?:black|hitam)\b/i],
    ['charcoal', /\bcharcoal\b/i],
    ['navy', /\bnavy\b/i],
    ['grey', /\b(?:grey|gray|abu)\b/i],
    ['coklat', /\b(?:coklat|brown|mahogany)\b/i],
    ['green', /\b(?:green|hijau)\b/i],
    ['maroon', /\bmaroon\b/i],
  ]
    .filter(([, pattern]) => (pattern as RegExp).test(customerText))
    .map(([name]) => name as string)

  if (!desiredColors.length && typeof params.lead?.color === 'string') {
    desiredColors.push(normalize(params.lead.color))
  }

  const requestedFabric = /(?:basic|twill)/i.test(customerText)
    ? 'basic twill stretch'
    : /(?:premium|wool|wol|cashmere)/i.test(customerText)
      ? 'premium wool blend cashmere italy'
      : typeof params.lead?.fabric === 'string'
        ? normalize(params.lead.fabric)
        : ''

  if (asksDifferentModel) {
    const options = pickByCategory(assets, 'model', customerText, {
      desiredModel: '',
      desiredColors,
      requestedFabric,
    }, wantsMultipleVisuals(customerText) ? 3 : 1)
    return options
  }

  if (asksDifferentFabric) {
    const current = normalize(String(params.lead?.fabric ?? ''))
    const fabricAssets = assets
      .filter(asset => asset.category === 'fabric' && normalize(asset.fabricName ?? '') !== current)
      .sort((a, b) => b.priority - a.priority || lexicalScore(b, customerText) - lexicalScore(a, customerText))
    return fabricAssets.slice(0, wantsMultipleVisuals(customerText) ? 2 : 1)
  }

  if (asksDifferentColor) {
    const currentColor = normalize(String(params.lead?.color ?? ''))
    return assets
      .filter(asset => asset.category === 'color_reference' && asset.colorName && normalize(asset.colorName) !== currentColor)
      .sort((a, b) => lexicalScore(b, customerText) - lexicalScore(a, customerText) || b.priority - a.priority)
      .slice(0, wantsMultipleVisuals(customerText) ? 3 : 1)
  }

  let categories = detectedCategories(customerText)
  if (!categories.length) categories = [leadModel ? 'model' : 'model']

  // "contoh model/bahan" can legitimately need two separate proofs. Send each as
  // a separate reference instead of returning nothing and leaving the agent to promise a photo.
  if (categories.includes('model') && categories.includes('fabric')) {
    const model = pickByCategory(assets, 'model', customerText, {
      desiredModel,
      desiredColors,
      requestedFabric,
    }, 1)
    const fabric = pickByCategory(assets, 'fabric', customerText, {
      desiredModel,
      desiredColors: [],
      requestedFabric,
    }, 1)
    return [...model, ...fabric].slice(0, 2)
  }

  const maxResults = wantsMultipleVisuals(customerText) ? 3 : 1
  const preferredOrder: AiSalesMediaCategory[] = [
    'collar',
    'placket',
    'pocket',
    'cufflink',
    'cutting',
    'zigzag',
    'fabric',
    'color_reference',
    'model_detail',
    'model',
    'kabak',
    'other',
  ]

  const requestedCategories = preferredOrder.filter(category => categories.includes(category))

  // A generic "lihat model/contoh model" should show actual model assets, not
  // starter close-ups. If the customer named no model, show a small varied set.
  if (categories.includes('model') && !desiredModel && requestedCategories.length === 1) {
    return pickByCategory(assets, 'model', customerText, {
      desiredModel: '',
      desiredColors,
      requestedFabric,
    }, maxResults)
  }

  const selected: AiSalesMediaAsset[] = []
  for (const category of requestedCategories) {
    const remaining = maxResults - selected.length
    if (remaining <= 0) break
    const picked = pickByCategory(assets, category, customerText, {
      desiredModel,
      desiredColors,
      requestedFabric,
    }, remaining)
    for (const asset of picked) {
      if (!selected.some(existing => existing.assetKey === asset.assetKey)) selected.push(asset)
    }
  }

  // Last chance for a broad visual request: prefer a real model reference over an
  // unrelated detail close-up.
  if (!selected.length && /(?:foto|gambar|contoh|visual|lihat|liat)/i.test(normalizedText)) {
    return pickByCategory(assets, 'model', customerText, {
      desiredModel,
      desiredColors,
      requestedFabric,
    }, maxResults)
  }

  return selected.slice(0, maxResults)
}
