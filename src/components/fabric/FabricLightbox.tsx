'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { supabaseImageLoader } from '@/lib/supabase/imageLoader'

interface FabricLightboxProps {
  images: string[]
  alt: string
  initialIndex: number
  onClose: () => void
}

// Loaded via next/dynamic({ ssr: false }) from FabricGallery — never part
// of the initial page bundle, only fetched once a user actually opens it.
export function FabricLightbox({ images, alt, initialIndex, onClose }: FabricLightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const pinchState = useRef<{ startDistance: number; startScale: number } | null>(null)
  const swipeState = useRef<{ startX: number } | null>(null)

  const goNext = () => {
    setScale(1)
    setIndex((i) => (i + 1) % images.length)
  }
  const goPrev = () => {
    setScale(1)
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  // Focus the close button on open (so keyboard/screen-reader users land
  // inside the dialog immediately), lock body scroll, and restore focus to
  // whatever triggered the lightbox on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && images.length > 1) goNext()
      else if (e.key === 'ArrowLeft' && images.length > 1) goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, onClose])

  function touchDistance(touches: React.TouchList): number {
    const [a, b] = [touches[0], touches[1]]
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — fullscreen image viewer`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-black/95"
      onTouchStart={(e) => {
        if (e.touches.length === 2) {
          pinchState.current = { startDistance: touchDistance(e.touches), startScale: scale }
        } else if (e.touches.length === 1) {
          swipeState.current = { startX: e.touches[0].clientX }
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 2 && pinchState.current) {
          const newDistance = touchDistance(e.touches)
          const nextScale = (newDistance / pinchState.current.startDistance) * pinchState.current.startScale
          setScale(Math.min(Math.max(nextScale, 1), 4))
        }
      }}
      onTouchEnd={(e) => {
        pinchState.current = null
        if (scale === 1 && swipeState.current && e.changedTouches.length === 1 && images.length > 1) {
          const deltaX = e.changedTouches[0].clientX - swipeState.current.startX
          if (deltaX > 50) goPrev()
          else if (deltaX < -50) goNext()
        }
        swipeState.current = null
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close fullscreen viewer"
        className="absolute right-4 top-4 z-10 rounded-full bg-luxury-charcoal/60 p-2 text-luxury-ivory transition hover:bg-luxury-espresso-elevated focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
      >
        <span aria-hidden="true" className="block h-5 w-5 text-lg leading-none">
          ×
        </span>
      </button>

      {images.length > 1 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-luxury-charcoal/60 p-3 text-luxury-ivory transition hover:bg-luxury-espresso-elevated focus-visible:ring-2 focus-visible:ring-luxury-gold/50 md:left-4"
        >
          <span aria-hidden="true">‹</span>
        </button>
      )}

      <div className="relative h-[80vh] w-[90vw] max-w-4xl overflow-hidden">
        <Image
          src={images[index]}
          alt={`${alt} — image ${index + 1} of ${images.length}`}
          loader={supabaseImageLoader}
          fill
          sizes="90vw"
          className="object-contain transition-transform duration-150 ease-out"
          style={{ transform: `scale(${scale})` }}
        />
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label="Next image"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-luxury-charcoal/60 p-3 text-luxury-ivory transition hover:bg-luxury-espresso-elevated focus-visible:ring-2 focus-visible:ring-luxury-gold/50 md:right-4"
        >
          <span aria-hidden="true">›</span>
        </button>
      )}

      {images.length > 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-luxury-sans text-xs text-luxury-taupe">
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  )
}
