'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { garmentPhotos } from '@/lib/marketing/assets'

// Sprint W1 revision — replaces the Hero's 3D geometry entirely with a
// cinematic treatment of real garment photography: slow Ken Burns zoom,
// vignette, subtle film grain, a soft light sweep, sparse drifting dust,
// and very light mouse parallax. All 2D (transform/opacity only, no
// WebGL/Three.js), and every motion effect is skipped outright under
// prefers-reduced-motion — the photo just sits still.
//
// Uses a different garment photo (navy) than the Appointment section
// (black pinstripe) further down the page, so the two don't repeat the
// same image back-to-back while scrolling.
export function HeroCinematicVisual({ alt }: { alt: string }) {
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 40, damping: 20 })
  const springY = useSpring(pointerY, { stiffness: 40, damping: 20 })

  useEffect(() => {
    if (reduceMotion) return
    function onPointerMove(e: PointerEvent) {
      pointerX.set((e.clientX / window.innerWidth - 0.5) * 10)
      pointerY.set((e.clientY / window.innerHeight - 0.5) * 8)
    }
    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [reduceMotion, pointerX, pointerY])

  return (
    <div className="absolute inset-0 overflow-hidden bg-luxury-black">
      <motion.div
        className="absolute inset-0"
        style={reduceMotion ? undefined : { x: springX, y: springY }}
        animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={reduceMotion ? undefined : { duration: 26, ease: 'easeInOut', repeat: Infinity }}
      >
        <Image
          src={garmentPhotos.navy}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Vignette — a light cinematic edge-darken only, not a heavy scrim.
          The layout no longer overlaps text on the photo (see Hero.tsx's
          split columns), so this only needs to add depth, not guarantee
          text contrast — the first pass here was strong enough to crush an
          already-dark photo to near-black. */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(10,9,8,0.35)_100%)]" />

      {/* Film grain — static, subtle, cheap (SVG feTurbulence, no image bytes) */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay">
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      {!reduceMotion && (
        <>
          {/* Soft light sweep */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-luxury-gold/10 to-transparent"
            style={{ mixBlendMode: 'screen' }}
            animate={{ x: ['-20%', '340%'] }}
            transition={{ duration: 10, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
          />
          {/* Sparse drifting dust */}
          <div aria-hidden="true" className="absolute inset-0">
            {DUST_POSITIONS.map((pos, i) => (
              <span
                key={i}
                className="absolute h-1 w-1 animate-luxury-drift rounded-full bg-luxury-gold/40 blur-[1px]"
                style={{ left: pos.left, top: pos.top, animationDelay: `${pos.delay}s`, animationDuration: `${pos.duration}s` }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const DUST_POSITIONS = [
  { left: '15%', top: '20%', delay: 0, duration: 14 },
  { left: '70%', top: '15%', delay: 2, duration: 16 },
  { left: '40%', top: '55%', delay: 4, duration: 12 },
  { left: '85%', top: '65%', delay: 1, duration: 18 },
  { left: '25%', top: '80%', delay: 3, duration: 15 },
  { left: '60%', top: '35%', delay: 5, duration: 13 },
]
