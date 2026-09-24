# AI Sales Media — Cloudflare R2 Architecture

Local Tailor uses Cloudflare R2 as the primary binary storage for AI Sales images.

Supabase remains the source of truth for metadata only:
- asset key
- category
- caption
- tags / trigger terms
- model/fabric/color/part metadata
- activation state
- public image URL

The existing Supabase bucket `ai-sales-media` is no longer the preferred upload target. It may remain in place for backward compatibility, but new ingestion should use R2.

## Why R2

- image storage is separated from the production database
- R2 public delivery can scale without consuming Supabase Storage quota
- WhatsApp Cloud API can send images by public HTTPS URL
- LTOS AI selection logic already reads `image_url`, so the runtime is storage-provider agnostic

## Required Cloudflare setup

Create one R2 bucket, recommended name:

`local-tailor-ai-sales-media`

Create R2 API credentials with Object Read & Write access restricted to that bucket.

Expose the bucket through either:
1. a custom domain, recommended: `media.localtailor.id`, or
2. an R2 public development URL while testing

Do not commit any Cloudflare credential to Git.

## Local environment variables

Set these only in the local terminal session used for ingestion:

`CLOUDFLARE_ACCOUNT_ID`
`R2_ACCESS_KEY_ID`
`R2_SECRET_ACCESS_KEY`
`R2_BUCKET_NAME`
`R2_PUBLIC_BASE_URL`
`SUPABASE_URL`
`SUPABASE_SERVICE_ROLE_KEY`

The upload script never prints the secret values.

## Upload workflow

The canonical script is:

`scripts/upload-ai-sales-media-r2.ts`

Dry run:

`npx tsx scripts/upload-ai-sales-media-r2.ts --manifest "C:\\kirim gambar ke Customer\\ai-sales-media-manifest.json"`

Real upload:

`npx tsx scripts/upload-ai-sales-media-r2.ts --manifest "C:\\kirim gambar ke Customer\\ai-sales-media-manifest.json" --apply`

Default behavior:
- original local files are untouched
- upload copy is normalized to WebP
- max dimensions 1800 × 2400
- WebP quality 84
- local duplicate SHA-256 files are skipped
- existing duplicate hashes in LTOS are skipped
- R2 object upload is idempotent by object key
- DB metadata is upserted by `asset_key`
- every ingested asset remains `is_active=false`
- every ingested asset remains `is_starter=false`

No uploaded image becomes customer-facing until owner review.

## Runtime flow

`WhatsApp customer`
→ `LTOS/OpenAI determines relevant visual`
→ `ai_sales_media_assets metadata in Supabase`
→ `public image URL on Cloudflare R2`
→ `WhatsApp Cloud API image message`

## Activation workflow

After ingestion:

1. review mapping and captions
2. activate only verified assets
3. choose at most three starter images:
   - finished/model visual
   - Premium Wool Blend Cashmere Italy visual
   - useful color reference
4. set `is_starter=true` and starter ranks 1–3
5. test on a controlled WhatsApp conversation before broad use

## Security

Never:
- put R2 secret keys in the repo
- put Supabase service-role keys in the repo
- grant public write access to R2
- enable all assets automatically after ingestion
- derive current prices from local folder names
