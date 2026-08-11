'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { supabaseImageLoader } from '@/lib/supabase/imageLoader'

interface ZoomableImageProps {
  src: string
  alt: string
  priority?: boolean
  onOpenFullscreen: () => void
}

// Desktop: hover-zoom — the image scales up and its transform-origin
// follows the cursor, a lightweight stand-in for a magnifying-glass effect
// that needs no extra assets (no separate high-res "texture close-up"
// field exists in Material Master — see materialRepository.ts's
// getMaterialGallery(), whatever image is shown here is the same one used
// everywhere else). Mobile has no hover state at all, so it's gated behind
// a pointer-fine check rather than shipped dead-weight to touch devices.
// Tap on any device opens the fullscreen Lightbox (pinch-zoom lives there).
export function ZoomableImage({ src, alt, priority = false, onOpenFullscreen }: ZoomableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const [transformFailed, setTransformFailed] = useState(false)

  function handlePointerMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-luxury-gold/10 bg-luxury-navy-deep"
      onMouseEnter={() => setZoomed(window.matchMedia('(pointer: fine)').matches)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handlePointerMove}
      onClick={onOpenFullscreen}
      role="button"
      tabIndex={0}
      aria-label={`View ${alt} fullscreen`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenFullscreen()
        }
      }}
    >
      <Image
        key={transformFailed ? 'raw' : 'transformed'}
        src={src}
        alt={alt}
        loader={transformFailed ? undefined : supabaseImageLoader}
        unoptimized={transformFailed}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 45vw, 90vw"
        className="object-cover transition-transform duration-200 ease-out"
        style={{ transform: zoomed ? 'scale(1.6)' : 'scale(1)', transformOrigin: origin }}
        onError={() => setTransformFailed(true)}
      />
      <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-luxury-black/60 px-2.5 py-1 font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-ivory opacity-0 transition group-hover:opacity-100">
        Click to enlarge
      </span>
    </div>
  )
}
