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
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function isBroadInfoRequest(text: string): boolean {
  return /(minta|mohon|boleh|bisa).*info.*(custom|thobe|jubah)|(info|informasi).*(custom|thobe|jubah)|(custom|thobe|jubah).*info/i.test(
    text
  )
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

function starterPack(assets: AiSalesMediaAsset[]): AiSalesMediaAsset[] {
  const starters = assets
    .filter(asset => asset.isStarter)
    .sort(
      (a, b) =>
        (a.starterRank ?? 99) - (b.starterRank ?? 99) ||
        b.priority - a.priority
    )

  const preferredOrder: AiSalesMediaCategory[] = ['model', 'fabric', 'color_reference']
  const selected: AiSalesMediaAsset[] = []

  for (const category of preferredOrder) {
    const asset = starters.find(item => item.category === category && !selected.some(existing => existing.assetKey === item.assetKey))
    if (asset) selected.push(asset)
  }

  for (const asset of starters) {
    if (selected.length >= 3) break
    if (!selected.some(existing => existing.assetKey === asset.assetKey)) selected.push(asset)
  }

  return selected.slice(0, 3)
}

export async function selectAiSalesMediaAssets(
  supabase: SupabaseClient,
  params: {
    customerText: string
    currentStage: AiSalesStage
  }
): Promise<AiSalesMediaAsset[]> {
  const { data, error } = await supabase
    .from('ai_sales_media_assets')
    .select(
      'asset_key, category, title, image_url, caption, tags, trigger_terms, model_family, fabric_name, color_name, part_name, is_starter, starter_rank, priority'
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
    }))
    .filter(asset => asset.assetKey && /^https?:\/\//i.test(asset.imageUrl))

  if (!assets.length) return []

  if (params.currentStage === 'new' && isBroadInfoRequest(params.customerText)) {
    return starterPack(assets)
  }

  const categories = detectedCategories(params.customerText)
  if (!categories.length) return []

  return assets
    .map(asset => ({
      asset,
      score:
        (categories.includes(asset.category) ? 100 : 0) +
        lexicalScore(asset, params.customerText) +
        asset.priority,
    }))
    .filter(item => item.score >= 100)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.asset)
}
