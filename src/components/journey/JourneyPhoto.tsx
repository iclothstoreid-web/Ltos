'use client'

import { useState } from 'react'

interface JourneyPhotoProps {
  src?: string | null
  alt: string
  className?: string
}

// Shared photo slot for every Milestone 2+ section — real photos (production
// evidence) always have a src, but curated brand photography (Hero,
// Craftsmanship) may not have its asset file dropped into public/ yet. Rather
// than a broken-image icon, a missing/failed src falls back to a quiet
// brand-tinted placeholder so the page still looks intentional before real
// photos are supplied.
export function JourneyPhoto({ src, alt, className = '' }: JourneyPhotoProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-primary/15 via-[#151c27]/5 to-primary/10 ${className}`}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL or static brand photography, not part of an optimized asset pipeline
    <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setFailed(true)} />
  )
}
