// Turns a `website-media` Storage object path into a browser URL.
//
// The bucket is public, so the raw object lives at
// `${SUPABASE_URL}/storage/v1/object/public/website-media/<path>`. For any
// on-page rendering we go through the Image Transformation endpoint
// instead (`/render/image/public/`), exactly like the Design Studio
// configurator (src/lib/configurator/thumb.ts) and the internal catalog
// (src/lib/supabase/imageLoader.ts) — a resized, browser-negotiated
// WebP/AVIF variant instead of the multi-MB original.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const BUCKET = 'website-media'

export function websiteMediaRawUrl(path: string | null | undefined): string | null {
  if (!path || !SUPABASE_URL) return null
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

interface TransformOpts {
  width: number
  height?: number
  quality?: number
  resize?: 'cover' | 'contain' | 'fill'
}

export function websiteMediaUrl(path: string | null | undefined, opts: TransformOpts): string | null {
  if (!path || !SUPABASE_URL) return null
  const params = new URLSearchParams({ width: String(Math.round(opts.width)) })
  if (opts.height) params.set('height', String(Math.round(opts.height)))
  params.set('quality', String(opts.quality ?? 72))
  if (opts.resize) params.set('resize', opts.resize)
  return `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET}/${path}?${params.toString()}`
}

// `1x, 2x` srcSet helper for a DPR-aware <img>.
export function websiteMediaSrcSet(path: string | null | undefined, opts: TransformOpts): string | undefined {
  const one = websiteMediaUrl(path, opts)
  if (!one) return undefined
  const two = websiteMediaUrl(path, { ...opts, width: opts.width * 2, height: opts.height ? opts.height * 2 : undefined })
  if (!two) return undefined
  return `${one} 1x, ${two} 2x`
}
