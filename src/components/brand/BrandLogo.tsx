'use client'

import React, { useEffect, useState } from 'react'
import { LOCAL_TAILOR_CONFIG } from '@/lib/brand/config'

export type LogoVariant = 'horizontal' | 'horizontalTagline' | 'vertical' | 'mark'

interface Props {
  variant?: LogoVariant
  className?: string
  alt?: string
  // LTOS Hero — Strict Visual Reference. `<img src="...svg">` renders the
  // SVG in an isolated image context, so its `fill="currentColor"` (see
  // public/brand/local-tailor/horizontal.svg) never actually inherits the
  // page's `color` — the logo stays whatever the SVG's own default fill is
  // (black) no matter what Tailwind text-color class is applied around it.
  // On a dark walnut background that renders the wordmark illegible. When
  // `inline` is true, the same SVG is fetched once and mounted as real
  // inline markup instead, so `currentColor` — and therefore a
  // `text-luxury-ivory` wrapper — actually works. Opt-in only; every
  // existing call site keeps the `<img>` path unchanged.
  inline?: boolean
}

// LTOS is single-brand (Local Tailor). Every variant maps to a fixed asset
// under public/brand/local-tailor/.
function localTailorLogoPath(variant: LogoVariant): string {
  switch (variant) {
    case 'mark':
      return '/brand/local-tailor/mark.svg'
    case 'vertical':
      return '/brand/local-tailor/vertical.svg'
    case 'horizontalTagline':
      return '/brand/local-tailor/horizontal-tagline.svg'
    case 'horizontal':
    default:
      return '/brand/local-tailor/horizontal.svg'
  }
}

export default function BrandLogo({ variant = 'horizontal', className, alt, inline = false }: Props) {
  const src = localTailorLogoPath(variant)
  const label = alt ?? LOCAL_TAILOR_CONFIG.displayName
  const [inlineMarkup, setInlineMarkup] = useState<string | null>(null)

  useEffect(() => {
    if (!inline) return
    let cancelled = false
    fetch(src)
      .then((res) => res.text())
      .then((svg) => {
        if (!cancelled) setInlineMarkup(svg)
      })
      .catch(() => {
        // Fall back to the <img> path below rather than rendering nothing.
      })
    return () => {
      cancelled = true
    }
  }, [inline, src])

  if (inline && inlineMarkup) {
    return (
      <span
        role="img"
        aria-label={label}
        className={`inline-block [&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${className ?? ''}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: inlineMarkup }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={label} className={className} suppressHydrationWarning />
  )
}
