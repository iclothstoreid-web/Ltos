'use client'

import React from 'react'
import { readClientBrandId } from '@/lib/brand/client'
import { LOGO_ASSETS, type LogoVariant } from '@/lib/brand/logoAssets'

interface Props {
  variant?: LogoVariant
  className?: string
  alt?: string
}

export default function BrandLogo({ variant = 'horizontal', className, alt }: Props) {
  const brandId = readClientBrandId()

  // Tarda uses a rasterized svg asset at /brand/tarda-home.svg (attached)
  if (brandId === 'tarda') {
    // Use <img> to reference the provided Tarda SVG file directly. The
    // file is intentionally preserved as-is and not inlined.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/brand/tarda-home.svg" alt={alt ?? 'Tarda'} className={className} />
    )
  }

  // Local Tailor — render the inline logo so it can inherit currentColor
  const asset = LOGO_ASSETS[variant]
  return (
    <svg
      role="img"
      aria-label={alt ?? 'Local Tailor'}
      viewBox={asset.viewBox}
      fill="currentColor"
      className={className}
      dangerouslySetInnerHTML={{ __html: asset.inner }}
    />
  )
}
