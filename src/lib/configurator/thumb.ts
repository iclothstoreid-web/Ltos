// Supabase Storage Image Transformation URLs for the public /design-studio
// configurator thumbnails.
//
// Audit 2026-08-27 — every option photo the configurator renders comes
// straight from `design_master_options.photo_url`, which points at the
// public `master-data-photos` bucket via `/storage/v1/object/public/`.
// Those originals are 6–16 MB phone captures (model_thobe avg 13.5 MB,
// kerah/manset/bahan ~6 MB) and were being dropped into `<img src>` at
// 24–200 px CSS with no resizing — ~180 MB / ~40 s to populate the panel
// on production.
//
// The `/render/image/public/` endpoint (Image Transformation add-on,
// already live on this project and used by the internal Design Studio
// through src/lib/supabase/imageLoader.ts) returns a resized, browser-
// negotiated WebP/AVIF variant of the same object: a 120 px collar thumb
// drops from 6 MB to ~1.6 KB.
//
// width-only does NOT scale proportionally on this project's transform
// endpoint — it leaves height untouched and horizontally squashes the
// image (documented at length in src/lib/supabase/imageLoader.ts). Always
// pass height = width + resize=contain here; the caller's existing
// `object-cover` / `object-contain` still does the final fit exactly as
// it did before.
const PUBLIC_OBJECT_MARKER = '/storage/v1/object/public/'
const RENDER_IMAGE_SEGMENT = '/storage/v1/render/image/public/'

export function configuratorThumb(
  url: string | null | undefined,
  size: number,
  quality = 70
): string | null {
  if (!url) return null
  const markerIndex = url.indexOf(PUBLIC_OBJECT_MARKER)
  // Not a Supabase public Storage URL (external/legacy) — leave it alone.
  if (markerIndex === -1) return url

  const base = url.slice(0, markerIndex)
  const objectPath = url.slice(markerIndex + PUBLIC_OBJECT_MARKER.length)
  const params = new URLSearchParams({
    width: String(Math.round(size)),
    height: String(Math.round(size)),
    resize: 'contain',
    quality: String(quality),
  })
  return `${base}${RENDER_IMAGE_SEGMENT}${objectPath}?${params.toString()}`
}

// `1x, 2x` srcSet for a DPR-aware `<img>`. Returns undefined when the
// source isn't transformable (so the caller just omits srcSet and keeps
// its plain src).
export function configuratorThumbSrcSet(
  url: string | null | undefined,
  size: number,
  quality = 70
): string | undefined {
  const one = configuratorThumb(url, size, quality)
  if (!one || one === url) return undefined
  const two = configuratorThumb(url, size * 2, quality)
  if (!two || two === url) return undefined
  return `${one} 1x, ${two} 2x`
}
