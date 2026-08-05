import type { ImageLoaderProps } from 'next/image'

const PUBLIC_OBJECT_MARKER = '/storage/v1/object/public/'
const RENDER_IMAGE_SEGMENT = '/storage/v1/render/image/public/'

// Supabase Storage's Image Transformation add-on serves resized/recompressed
// variants of the same file at /render/image/public/ instead of
// /object/public/ (confirmed available on this project). Anything that
// isn't a Supabase public Storage URL passes through untouched, so this is
// safe to use as a next/image `loader` wherever a photo_url may or may not
// be Supabase-hosted.
//
// Katalog Hero Image audit (2026-08-05) — passing `width` alone (no
// `height`) does NOT proportionally scale on this project's transform
// endpoint: verified directly against production (a 4000x5328 source
// returned 300x5328 for `?width=300` — height left completely untouched, a
// severe horizontal squash). Both callers (CatalogCard.tsx, aspect-square;
// SpecDetailModal.tsx, aspect-video) then crop that already-distorted image
// with CSS `object-cover`, compounding into the reported "crop/zoom"
// thumbnails. `height: width` + `resize: 'contain'` fits the image inside a
// square box while preserving its original aspect ratio (verified: the same
// 4000x5328 source now returns a correctly-proportioned 225x300) — the
// existing `object-cover` layer in each caller is untouched and does the
// final crop into whatever the real container shape is, exactly as it did
// before this Image Transformation pipeline existed.
export function supabaseImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const markerIndex = src.indexOf(PUBLIC_OBJECT_MARKER)
  if (markerIndex === -1) return src

  const base = src.slice(0, markerIndex)
  const objectPath = src.slice(markerIndex + PUBLIC_OBJECT_MARKER.length)
  const params = new URLSearchParams({
    width: String(width),
    height: String(width),
    resize: 'contain',
    quality: String(quality ?? 70),
  })

  return `${base}${RENDER_IMAGE_SEGMENT}${objectPath}?${params.toString()}`
}
