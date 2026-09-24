import 'dotenv/config'
import { createHash, createHmac } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

type ManifestRecord = Record<string, unknown>

type NormalizedAsset = {
  sourcePath: string
  assetKey: string
  category: string
  title: string
  caption: string
  tags: string[]
  triggerTerms: string[]
  modelFamily: string | null
  fabricName: string | null
  colorName: string | null
  partName: string | null
  priority: number
  sourceFolder: string | null
  sourceSha256: string
  objectKey: string
}

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const skipOptimize = args.includes('--skip-optimize')
const manifestFlag = args.findIndex(arg => arg === '--manifest')
const manifestPath =
  manifestFlag >= 0 && args[manifestFlag + 1]
    ? path.resolve(args[manifestFlag + 1])
    : path.resolve('ai-sales-media-manifest.json')

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name} environment variable.`)
  return value
}

function firstString(record: ManifestRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(item => item.trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[;,|]/)
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function numberValue(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function boolValue(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1'
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function encodePath(value: string): string {
  return value
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')
}

function sha256Hex(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex')
}

function hmac(key: Buffer | string, value: string): Buffer {
  return createHmac('sha256', key).update(value).digest()
}

function readManifest(filePath: string): ManifestRecord[] {
  if (!existsSync(filePath)) throw new Error(`Manifest not found: ${filePath}`)
  const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as unknown

  if (Array.isArray(parsed)) return parsed as ManifestRecord[]

  if (parsed && typeof parsed === 'object') {
    const root = parsed as Record<string, unknown>
    for (const key of ['assets', 'images', 'items', 'files', 'records']) {
      if (Array.isArray(root[key])) return root[key] as ManifestRecord[]
    }
  }

  throw new Error('Manifest must be an array or contain assets/images/items/files/records array.')
}

function normalizeRecord(record: ManifestRecord, manifestDir: string): NormalizedAsset | null {
  if (boolValue(record.review_required)) return null

  const rawPath = firstString(record, [
    'original_absolute_path',
    'absolute_path',
    'source_path',
    'sourcePath',
    'path',
    'file_path',
    'filepath',
  ])

  const assetKey = firstString(record, ['asset_key', 'assetKey'])
  const category = firstString(record, ['category'])
  const title = firstString(record, ['title', 'name']) ?? assetKey

  if (!rawPath || !assetKey || !category || !title) return null

  const sourcePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(manifestDir, rawPath)
  if (!existsSync(sourcePath)) return null

  const sourceBuffer = readFileSync(sourcePath)
  const sourceSha256 =
    firstString(record, ['sha256', 'file_hash', 'hash', 'checksum']) ?? sha256Hex(sourceBuffer)

  const extension = skipOptimize ? path.extname(sourcePath).toLowerCase().replace('.', '') || 'jpg' : 'webp'
  const objectKey =
    firstString(record, ['storage_key', 'object_key', 'objectKey']) ??
    `${slugify(category)}/${slugify(assetKey)}.${extension}`

  return {
    sourcePath,
    assetKey,
    category,
    title,
    caption: firstString(record, ['caption']) ?? '',
    tags: stringArray(record.tags),
    triggerTerms: stringArray(record.trigger_terms ?? record.triggerTerms),
    modelFamily: firstString(record, ['model_family', 'modelFamily']),
    fabricName: firstString(record, ['fabric_name', 'fabricName']),
    colorName: firstString(record, ['color_name', 'colorName']),
    partName: firstString(record, ['part_name', 'partName']),
    priority: Math.max(0, Math.min(100, Math.round(numberValue(record.priority, 50)))),
    sourceFolder: firstString(record, ['source_folder', 'sourceFolder', 'parent_folder']),
    sourceSha256,
    objectKey,
  }
}

async function optimizeImage(sourcePath: string): Promise<{ body: Buffer; contentType: string }> {
  if (skipOptimize) {
    const extension = path.extname(sourcePath).toLowerCase()
    const contentType =
      extension === '.png'
        ? 'image/png'
        : extension === '.webp'
          ? 'image/webp'
          : 'image/jpeg'
    return { body: readFileSync(sourcePath), contentType }
  }

  const body = await sharp(sourcePath)
    .rotate()
    .resize({
      width: 1800,
      height: 2400,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 84, effort: 4 })
    .toBuffer()

  return { body, contentType: 'image/webp' }
}

async function uploadR2(params: {
  body: Buffer
  objectKey: string
  contentType: string
}): Promise<void> {
  const accountId = requiredEnv('CLOUDFLARE_ACCOUNT_ID')
  const accessKeyId = requiredEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = requiredEnv('R2_SECRET_ACCESS_KEY')
  const bucket = requiredEnv('R2_BUCKET_NAME')

  const host = `${accountId}.r2.cloudflarestorage.com`
  const canonicalUri = `/${encodeURIComponent(bucket)}/${encodePath(params.objectKey)}`
  const url = `https://${host}${canonicalUri}`

  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = sha256Hex(params.body)

  const canonicalHeaders =
    `content-type:${params.contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n')

  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = hmac(kDate, 'auto')
  const kService = hmac(kRegion, 's3')
  const kSigning = hmac(kService, 'aws4_request')
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Content-Type': params.contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body: params.body,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`R2 upload failed (${response.status}) ${detail.slice(0, 500)}`)
  }
}

async function main() {
  const manifest = readManifest(manifestPath)
  const manifestDir = path.dirname(manifestPath)

  const normalized = manifest
    .map(record => normalizeRecord(record, manifestDir))
    .filter((asset): asset is NormalizedAsset => Boolean(asset))

  const duplicateHashes = new Map<string, string>()
  const uniqueAssets: NormalizedAsset[] = []
  let localDuplicateCount = 0

  for (const asset of normalized) {
    const existing = duplicateHashes.get(asset.sourceSha256)
    if (existing && existing !== asset.assetKey) {
      localDuplicateCount += 1
      continue
    }
    duplicateHashes.set(asset.sourceSha256, asset.assetKey)
    uniqueAssets.push(asset)
  }

  console.log(`Mode: ${apply ? 'APPLY' : 'DRY RUN'}`)
  console.log(`Manifest: ${manifestPath}`)
  console.log(`Manifest rows: ${manifest.length}`)
  console.log(`Uploadable rows: ${uniqueAssets.length}`)
  console.log(`Skipped/review/missing rows: ${manifest.length - normalized.length}`)
  console.log(`Local duplicate hashes skipped: ${localDuplicateCount}`)
  console.log(`Optimize: ${skipOptimize ? 'off' : 'WebP 84, max 1800x2400'}`)

  const byCategory = new Map<string, number>()
  for (const asset of uniqueAssets) {
    byCategory.set(asset.category, (byCategory.get(asset.category) ?? 0) + 1)
  }
  console.log('By category:', Object.fromEntries([...byCategory.entries()].sort()))

  if (!apply) {
    console.log('\nDry run only. No files or database rows were changed.')
    console.log('Re-run with --apply after reviewing this output.')
    return
  }

  const publicBaseUrl = requiredEnv('R2_PUBLIC_BASE_URL').replace(/\/+$/, '')
  const supabaseUrl = requiredEnv('SUPABASE_URL')
  const supabaseServiceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: existingRows, error: existingError } = await supabase
    .from('ai_sales_media_assets')
    .select('asset_key, source_sha256')

  if (existingError) throw existingError

  const existingHashOwners = new Map<string, string>()
  for (const row of existingRows ?? []) {
    if (row.source_sha256) existingHashOwners.set(String(row.source_sha256), String(row.asset_key))
  }

  let uploaded = 0
  let upserted = 0
  let skippedExistingDuplicate = 0
  let failed = 0

  for (const [index, asset] of uniqueAssets.entries()) {
    const existingOwner = existingHashOwners.get(asset.sourceSha256)
    if (existingOwner && existingOwner !== asset.assetKey) {
      skippedExistingDuplicate += 1
      console.log(`[${index + 1}/${uniqueAssets.length}] SKIP duplicate: ${asset.assetKey} = ${existingOwner}`)
      continue
    }

    try {
      const optimized = await optimizeImage(asset.sourcePath)
      await uploadR2({
        body: optimized.body,
        objectKey: asset.objectKey,
        contentType: optimized.contentType,
      })
      uploaded += 1

      const imageUrl = `${publicBaseUrl}/${encodePath(asset.objectKey)}`
      const { error: upsertError } = await supabase
        .from('ai_sales_media_assets')
        .upsert(
          {
            asset_key: asset.assetKey,
            category: asset.category,
            title: asset.title,
            image_url: imageUrl,
            caption: asset.caption,
            tags: asset.tags,
            trigger_terms: asset.triggerTerms,
            model_family: asset.modelFamily,
            fabric_name: asset.fabricName,
            color_name: asset.colorName,
            part_name: asset.partName,
            is_starter: false,
            starter_rank: null,
            priority: asset.priority,
            is_active: false,
            source_folder: asset.sourceFolder,
            storage_provider: 'r2',
            storage_key: asset.objectKey,
            source_sha256: asset.sourceSha256,
            byte_size: optimized.body.byteLength,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'asset_key' }
        )

      if (upsertError) throw upsertError
      upserted += 1
      existingHashOwners.set(asset.sourceSha256, asset.assetKey)
      console.log(`[${index + 1}/${uniqueAssets.length}] OK ${asset.assetKey}`)
    } catch (error) {
      failed += 1
      console.error(
        `[${index + 1}/${uniqueAssets.length}] FAIL ${asset.assetKey}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  const { count: dbCount } = await supabase
    .from('ai_sales_media_assets')
    .select('*', { count: 'exact', head: true })
    .eq('storage_provider', 'r2')

  console.log('\nUpload complete.')
  console.log({
    uploaded,
    upserted,
    skippedExistingDuplicate,
    failed,
    r2RowsInDatabase: dbCount ?? null,
  })

  if (failed > 0) process.exitCode = 1
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
