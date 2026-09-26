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
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function isBroadInfoRequest(text: string): boolean {
  return /(minta|mohon|boleh|bisa).*info.*(custom|thobe|jubah)|(info|informasi).*(custom|thobe|jubah)|(custom|thobe|jubah).*info/i.test(
    text
  )
}

function asksForVisual(text: string): boolean {
  return /(foto|photo|gambar|contoh|visual|lihat|tunjuk|kirim.*(model|bahan|warna|kerah|saku|manset|plaket)|(?:bahan|warna|model)\s+lain|warna\s+(?:navy|charcoal|putih|hitam|hijau|green|coklat|maroon)|bahan\s+(?:basic|premium|wool|cashmere|twill))/i.test(text)
}

function detectedCategories(text: string): AiSalesMediaCategory[] {
  const categories: AiSalesMediaCategory[] = []

  const add = (category: AiSalesMediaCategory, pattern: RegExp) => {
    if (pattern.test(text) && !categories.includes(category)) categories.push(category)
  }

  add('model_detail', /(detail.*model|model.*detail)/i)
  add('collar', /(kerah|collar)/i)
  add('cufflink', /(manset|cuff\s*link|cufflink|cuff)/i)
  add('placket', /(plaket|placket)/i)
  add('pocket', /(saku|pocket)/i)
  add('cutting', /(cutting|slim\s*fit|semi\s*slim|regular\s*fit|standard\s*fit)/i)
  add('zigzag', /(zig\s*-?\s*zag|handmade)/i)
  add('kabak', /\bkabak\b/i)
  add('fabric', /(bahan|kain|fabric|wool|cashmere|twill)/i)
  add('color_reference', /(warna|colour|color)/i)
  add('model', /(model|saudi|qatary|qatar|emirates|dubai)/i)

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
  const starters = assets
    .filter(asset => asset.isStarter && normalize(asset.sourceFolder ?? '') === 'kirim pertama')
    .sort(
      (a, b) =>
        lexicalScore(b, customerText) - lexicalScore(a, customerText) ||
        (a.starterRank ?? 99) - (b.starterRank ?? 99) ||
        b.priority - a.priority
    )

  // Owner-approved opening sequence: five close-ups of actual workmanship.
  // Subsequent turns use a single relevant image and never resend a key.
  return starters.slice(0, 5)
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
    .limit(200)

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

  const customerText = params.customerText
  const asksDifferentModel = /(?:model|potongan)\s+(?:lain|beda)/i.test(customerText)
  const asksDifferentFabric = /(?:bahan|kain)\s+(?:lain|beda)/i.test(customerText)
  const asksDifferentColor = /(?:warna|colour|color)\s+(?:lain|beda)/i.test(customerText)

  if (asksDifferentModel) {
    const collar = assets.find(asset => asset.assetKey === 'collar.haybah.001')
    return collar ? [collar] : []
  }

  if (asksDifferentFabric) {
    const current = normalize(String(params.lead?.fabric ?? ''))
    const alternative = current.includes('premium wool blend cashmere italy')
      ? 'fabric.basic_twill_stretch.001'
      : 'fabric.premium_wool_blend_cashmere_italy.001'
    const fabric = assets.find(asset => asset.assetKey === alternative)
    return fabric ? [fabric] : []
  }

  if (params.currentStage === 'new' && !params.sentAssetKeys?.length && isBroadInfoRequest(customerText) &&
      !/(?:bahan|kain|warna|colour|color|model)\s+(?:lain|beda)/i.test(customerText) &&
      !/(saudi|qatary|emirates|dubai|navy|charcoal|putih|hitam|hijau|coklat|maroon|basic|premium|wool|cashmere|twill)/i.test(customerText)) {
    return starterPack(assets, customerText)
  }

  // A customer asking about price, location, or measurements needs an answer,
  // not an unrelated product image. For later turns, send only requested visuals.
  if (!asksForVisual(customerText)) return []

  const leadModel = typeof params.lead?.model === 'string' ? normalize(params.lead.model) : ''
  const categories = detectedCategories(params.customerText)
  if (!categories.length) {
    if (!leadModel) return starterPack(assets, customerText).slice(0, 1)
    categories.push('model')
  }
  const mentionedModels = ['saudi', 'qatary', 'emirates dubai'].filter(name =>
    normalize(params.customerText).includes(name)
  )
  const desiredModel = mentionedModels[0] ?? leadModel
  const mentionedColors = ['white', 'putih', 'black', 'hitam', 'charcoal', 'navy', 'grey', 'abu', 'coklat bata', 'coklat', 'green', 'hijau', 'maroon']
    .filter(name => normalize(params.customerText).includes(name))
  const desiredColors = mentionedColors.length ? mentionedColors :
    typeof params.lead?.color === 'string' ? [normalize(params.lead.color)] : []
  const requestedFabric = /(?:basic|twill)/i.test(customerText)
    ? 'basic twill stretch'
    : /(?:premium|wool|wol|cashmere)/i.test(customerText)
      ? 'premium wool blend cashmere italy'
      : typeof params.lead?.fabric === 'string' ? normalize(params.lead.fabric) : ''
  if (categories.includes('fabric') && /(?:dior|gianluca|lorenzo|mark|fiacinito|sharkskin)/i.test(customerText) &&
      !/(?:basic|twill|premium|wool|wol|cashmere)/i.test(customerText)) return []

  // A model photo has no verified fabric identity. Never imply a material
  // from a model photograph when the customer asks for that combination.
  if (categories.includes('model') && categories.includes('fabric')) return []
  if (categories.includes('model') && !desiredModel) return starterPack(assets, customerText).slice(0, 1)

  if (asksDifferentColor) {
    const currentColor = normalize(String(params.lead?.color ?? ''))
    const reference = assets
      .filter(asset => asset.category === 'color_reference' && asset.colorName &&
        normalize(asset.colorName) !== currentColor)
      .sort((a, b) => b.priority - a.priority || a.assetKey.localeCompare(b.assetKey))[0]
    return reference ? [reference] : []
  }

  return assets
    .filter(asset => {
      if (asset.category === 'model' && desiredModel && normalize(asset.modelFamily ?? '') !== desiredModel) return false
      if (asset.category === 'fabric' && requestedFabric && normalize(asset.fabricName ?? '') !== requestedFabric) return false
      if (asset.colorName && desiredColors.length &&
          !desiredColors.some(color => normalize(asset.colorName ?? '') === color ||
            (color === 'putih' && normalize(asset.colorName ?? '') === 'white') ||
            (color === 'hitam' && ['black', 'hitam'].includes(normalize(asset.colorName ?? ''))) ||
            (color === 'hijau' && normalize(asset.colorName ?? '') === 'green'))) return false
      return true
    })
    .map(asset => ({
      asset,
      score:
        (categories.includes(asset.category) ? 100 : 0) +
        lexicalScore(asset, params.customerText) +
        asset.priority,
    }))
    .filter(item => item.score >= 100 && categories.includes(item.asset.category))
    .sort((a, b) => b.score - a.score)
    .slice(0, 1)
    .map(item => item.asset)
}
