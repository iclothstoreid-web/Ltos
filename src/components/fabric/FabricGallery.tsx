'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { supabaseImageLoader } from '@/lib/supabase/imageLoader'
import { ZoomableImage } from './ZoomableImage'

// Dynamic import (§13 Performance) — the fullscreen viewer and its touch/
// keyboard/focus-trap logic are only ever needed after a user opens it, so
// they never ship in the detail page's initial JS.
const FabricLightbox = dynamic(() => import('./FabricLightbox').then((m) => m.FabricLightbox), { ssr: false })

interface FabricGalleryProps {
  images: string[]
  alt: string
}

export function FabricGallery({ images, alt }: FabricGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const swipeStartX = useRef(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/30 font-luxury-sans text-[11px] uppercase tracking-[0.14em] text-luxury-taupe">
        No Image
      </div>
    )
  }

  return (
    <div
      className="w-full"
      role="group"
      aria-roledescription="image gallery"
      aria-label={alt}
      onKeyDown={(e) => {
        if (images.length < 2) return
        if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % images.length)
        else if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + images.length) % images.length)
      }}
      onTouchStart={(e) => {
        swipeStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (images.length < 2) return
        const deltaX = e.changedTouches[0].clientX - swipeStartX.current
        if (deltaX > 50) setActiveIndex((i) => (i - 1 + images.length) % images.length)
        else if (deltaX < -50) setActiveIndex((i) => (i + 1) % images.length)
      }}
    >
      <ZoomableImage src={images[activeIndex]} alt={alt} priority onOpenFullscreen={() => setLightboxOpen(true)} />

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={`${alt} thumbnails`}>
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition focus-visible:ring-2 focus-visible:ring-luxury-gold/50 ${
                i === activeIndex ? 'border-luxury-gold' : 'border-luxury-gold/15 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={src} alt="" loader={supabaseImageLoader} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <FabricLightbox images={images} alt={alt} initialIndex={activeIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  )
}
