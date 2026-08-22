'use client'

import React, { useEffect, useState } from 'react'
import { readClientBrandId } from '@/lib/brand/client'
import { getBrandFromHost } from '@/lib/brand/resolver'
import type { BrandConfig } from '@/lib/brand/types'

export type LogoVariant = 'horizontal' | 'horizontalTagline' | 'vertical' | 'mark'

interface Props {
  variant?: LogoVariant
  className?: string
  alt?: string
}

function resolveBrandLogoPath(brand: BrandConfig, variant: LogoVariant): string {
  if (brand.id === 'tarda') {
    return brand.assets.logoHorizontal ?? '/brand/tarda-home.svg'
  }

  switch (variant) {
    case 'mark':
      return brand.assets.logoMark ?? '/brand/local-tailor/mark.svg'
    case 'vertical':
      return '/brand/local-tailor/vertical.svg'
    case 'horizontalTagline':
      return '/brand/local-tailor/horizontal-tagline.svg'
    case 'horizontal':
    default:
      return brand.assets.logoHorizontal ?? '/brand/local-tailor/horizontal.svg'
  }
}

export default function BrandLogo({ variant = 'horizontal', className, alt }: Props) {
  const [brand, setBrand] = useState<BrandConfig | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const runtimeBrandId = readClientBrandId() ?? getBrandFromHost(window.location.hostname).id
    const resolvedBrand = getBrandFromHost(
      runtimeBrandId === 'tarda' ? 'tarda.vercel.app' : runtimeBrandId === 'local-tailor' ? 'localtailor.id' : window.location.hostname
    )

    setBrand(resolvedBrand)
  }, [])

  if (!brand) return null

  const src = resolveBrandLogoPath(brand, variant)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? brand.displayName} className={className} suppressHydrationWarning />
  )
}
