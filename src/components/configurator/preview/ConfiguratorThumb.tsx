'use client'

import { useState } from 'react'
import { configuratorThumb, configuratorThumbSrcSet } from '@/lib/configurator/thumb'

interface ConfiguratorThumbProps {
  photoUrl: string | null | undefined
  alt: string
  /** Target CSS size in px (the largest edge). Drives the Supabase
   *  transform width/height; the caller's own object-fit does the crop. */
  size: number
  quality?: number
  className?: string
}

// The one `<img>` every configurator surface renders option photos
// through (OptionCard swatch/photo, the 5 preview overlay layers). Swaps
// the 6–16 MB `master-data-photos` original for a resized transform
// variant (see src/lib/configurator/thumb.ts) and falls back to the
// untransformed URL if the transform endpoint 400s on a legacy
// over-resolution source — same resilience pattern as the internal
// Design Studio's CatalogCard.
export function ConfiguratorThumb({ photoUrl, alt, size, quality, className }: ConfiguratorThumbProps) {
  const [transformFailed, setTransformFailed] = useState(false)

  if (!photoUrl) return null

  const src = transformFailed ? photoUrl : configuratorThumb(photoUrl, size, quality) ?? photoUrl
  const srcSet = transformFailed ? undefined : configuratorThumbSrcSet(photoUrl, size, quality)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => !transformFailed && setTransformFailed(true)}
    />
  )
}
