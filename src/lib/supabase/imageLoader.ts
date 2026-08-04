import type { ImageLoaderProps } from 'next/image'

const PUBLIC_OBJECT_MARKER = '/storage/v1/object/public/'
const RENDER_IMAGE_SEGMENT = '/storage/v1/render/image/public/'

// Supabase Storage's Image Transformation add-on serves resized/recompressed
// variants of the same file at /render/image/public/ instead of
// /object/public/ (confirmed available on this project). Anything that
// isn't a Supabase public Storage URL passes through untouched, so this is
// safe to use as a next/image `loader` wherever a photo_url may or may not
// be Supabase-hosted.
export function supabaseImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const markerIndex = src.indexOf(PUBLIC_OBJECT_MARKER)
  if (markerIndex === -1) return src

  const base = src.slice(0, markerIndex)
  const objectPath = src.slice(markerIndex + PUBLIC_OBJECT_MARKER.length)
  const params = new URLSearchParams({ width: String(width), quality: String(quality ?? 70) })

  return `${base}${RENDER_IMAGE_SEGMENT}${objectPath}?${params.toString()}`
}
