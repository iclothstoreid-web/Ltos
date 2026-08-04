'use client'

import { useState } from 'react'

interface JourneyPhotoProps {
  src?: string | null
  alt: string
  className?: string
  // Sprint UX-03.1 (Photo Display Consistency) — opt-in tap-to-fullscreen,
  // additive/backward-compatible: every existing caller (MilestoneHero,
  // ProfileCard) that doesn't pass this renders exactly as before. Only the
  // real documentation-photo galleries (PhotoGridSection, TodaysJourneySection)
  // turn it on, since curated brand/profile imagery isn't "documentation" a
  // customer needs to inspect closer.
  expandable?: boolean
}

// Shared photo slot for every Milestone 2+ section — real photos (production
// evidence) always have a src, but curated brand photography (Hero,
// Craftsmanship) may not have its asset file dropped into public/ yet. Rather
// than a broken-image icon, a missing/failed src falls back to a quiet
// brand-tinted placeholder so the page still looks intentional before real
// photos are supplied.
export function JourneyPhoto({ src, alt, className = '', expandable = false }: JourneyPhotoProps) {
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-primary/15 via-on-surface/5 to-primary/10 ${className}`}
      />
    )
  }

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL or static brand photography, not part of an optimized asset pipeline
    <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setFailed(true)} />
  )

  if (!expandable) return img

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
        aria-label={`Perbesar ${alt}`}
      >
        {img}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-on-surface/90 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-surface/15 text-surface flex items-center justify-center hover:bg-surface/25 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.3 6.3-1.41-1.41L9.17 12l-6.3-6.29 1.41-1.42L10.59 10.6l6.3-6.3z" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- same Supabase Storage source as the thumbnail above, shown at natural aspect ratio (no crop) */}
          <img
            src={src}
            alt={alt}
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-sm"
          />
        </div>
      )}
    </>
  )
}
