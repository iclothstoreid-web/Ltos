import assert from 'node:assert/strict'
import type { SupabaseClient } from '@supabase/supabase-js'
import { selectAiSalesMediaAssets } from '../src/lib/ai-sales/media'

const rows = [
  { asset_key: 'model_detail.collar_zigzag_white.001', category: 'model_detail', title: 'Detail jahitan putih', image_url: 'https://example.com/detail.webp', caption: 'Detail jahitan', tags: ['detail'], trigger_terms: ['jahitan'], model_family: null, color_name: 'white', source_folder: 'Kirim pertama', is_starter: true, starter_rank: 1, priority: 80 },
  ...[2, 3, 4, 5, 6].map(rank => ({ asset_key: `model_detail.starter.${rank}`, category: 'model_detail', title: `Detail jahitan ${rank}`, image_url: `https://example.com/detail-${rank}.webp`, caption: 'Detail jahitan', tags: ['detail'], trigger_terms: ['jahitan'], model_family: null, color_name: null, source_folder: 'Kirim pertama', is_starter: true, starter_rank: rank, priority: 80 })),
  { asset_key: 'model.saudi.white', category: 'model', title: 'Saudi putih', image_url: 'https://example.com/saudi.webp', caption: 'Contoh Saudi', tags: ['saudi'], trigger_terms: ['saudi'], model_family: 'Saudi', color_name: 'white', source_folder: 'Kirim Model/Saudi', is_starter: false, starter_rank: null, priority: 80 },
  { asset_key: 'model.qatary.grey', category: 'model', title: 'Qatary grey', image_url: 'https://example.com/qatary.webp', caption: 'Contoh Qatary', tags: ['qatary'], trigger_terms: ['qatary'], model_family: 'Qatary', color_name: 'grey', is_starter: false, starter_rank: null, priority: 90 },
  { asset_key: 'collar.haybah.001', category: 'collar', title: 'Haybah Collar', image_url: 'https://example.com/haybah.webp', caption: 'Detail Haybah', tags: ['haybah'], trigger_terms: ['kerah'], model_family: null, color_name: null, is_starter: false, starter_rank: null, priority: 80 },
  { asset_key: 'collar.shanghai', category: 'collar', title: 'Kerah Shanghai', image_url: 'https://example.com/collar.webp', caption: 'Detail kerah', tags: ['kerah'], trigger_terms: ['kerah'], model_family: null, color_name: null, is_starter: false, starter_rank: null, priority: 70 },
  { asset_key: 'fabric.basic_twill_stretch.001', category: 'fabric', title: 'Basic Twill Stretch', image_url: 'https://example.com/basic.webp', caption: 'Contoh basic', tags: ['basic'], trigger_terms: ['basic twill stretch'], fabric_name: 'Basic Twill Stretch', is_starter: false, priority: 80 },
  { asset_key: 'fabric.premium_wool_blend_cashmere_italy.001', category: 'fabric', title: 'Premium Wool Blend Cashmere Italy', image_url: 'https://example.com/premium.webp', caption: 'Contoh premium', tags: ['premium'], trigger_terms: ['premium wool blend cashmere italy'], fabric_name: 'Premium Wool Blend Cashmere Italy', is_starter: false, priority: 80 },
  { asset_key: 'color_reference.charcoal.001', category: 'color_reference', title: 'Referensi Charcoal', image_url: 'https://example.com/charcoal.webp', caption: 'Referensi Charcoal', tags: ['charcoal'], trigger_terms: ['warna'], color_name: 'charcoal', is_starter: false, priority: 80 },
  { asset_key: 'color_reference.navy.001', category: 'color_reference', title: 'Referensi Navy', image_url: 'https://example.com/navy.webp', caption: 'Referensi Navy', tags: ['navy'], trigger_terms: ['warna'], color_name: 'navy', is_starter: false, priority: 70 },
  { asset_key: 'color_reference.green.001', category: 'color_reference', title: 'Referensi Hijau', image_url: 'https://example.com/green.webp', caption: 'Referensi Hijau', tags: ['green'], trigger_terms: ['warna'], color_name: 'green', is_starter: false, priority: 60 },
]

const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => ({ limit: async () => ({ data: rows, error: null }) }),
      }),
    }),
  }),
} as unknown as SupabaseClient

async function select(customerText: string, lead: Record<string, unknown> = {}, sentAssetKeys: string[] = []) {
  return selectAiSalesMediaAssets(supabase, { customerText, currentStage: 'new', lead, sentAssetKeys })
}

async function main() {
  const opening = ['model_detail.collar_zigzag_white.001', ...[2, 3, 4, 5].map(rank => `model_detail.starter.${rank}`)]
  assert.deepEqual((await select('KangBro, bisa minta info lebih lengkap untuk custom thobenya?')).map(a => a.assetKey), opening)
  assert.deepEqual((await select('KangBro, bisa minta info lebih lengkap untuk custom thobenya? Alamatnya di mana?')).map(a => a.assetKey), opening)
  assert.deepEqual((await select('KangBro, bisa minta info lebih lengkap untuk custom thobenya?', {}, opening)).map(a => a.assetKey), [])
  assert.deepEqual(await select('Berapa harga model Saudi?'), [])
  assert.deepEqual((await select('Boleh lihat contoh model Qatary?')).map(a => a.assetKey), ['model.qatary.grey'])
  assert.deepEqual((await select('Boleh lihat contoh fotonya?', { model: 'Qatary' })).map(a => a.assetKey), ['model.qatary.grey'])
  assert.deepEqual((await select('Boleh lihat contoh model Qatary?', {}, ['model.qatary.grey'])), [])
  assert.deepEqual(await select('Ada contoh model wool blend?'), [])
  assert.deepEqual((await select('Mau model lain')).map(a => a.assetKey), ['collar.haybah.001'])
  assert.deepEqual((await select('Ada bahan lain?', { fabric: 'Basic Twill Stretch' })).map(a => a.assetKey), ['fabric.premium_wool_blend_cashmere_italy.001'])
  assert.deepEqual((await select('Ada warna lain?', { color: 'charcoal' })).map(a => a.assetKey), ['color_reference.navy.001'])
  assert.deepEqual((await select('Bisa kirim foto kerah Haybah?')).map(a => a.assetKey), ['collar.haybah.001'])
  assert.deepEqual((await select('Ada contoh bahan premium?')).map(a => a.assetKey), ['fabric.premium_wool_blend_cashmere_italy.001'])
  assert.deepEqual((await select('Boleh lihat warna hijau?')).map(a => a.assetKey), ['color_reference.green.001'])
  assert.deepEqual((await select('Boleh lihat contoh bahan Dior?')), [])
  process.stdout.write('AI Sales media flow: 15 scenarios passed.\n')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
