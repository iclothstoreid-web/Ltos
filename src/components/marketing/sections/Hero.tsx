'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useSpring, useTransform, useVelocity, type Variants } from 'framer-motion'
import { heroCopy } from '@/lib/marketing/copy'
import { MagneticButton } from '../shell/MagneticButton'

const HeroDepthField = dynamic(() => import('./HeroDepthField').then((m) => m.HeroDepthField), { ssr: false })

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

// Sprint W1 revision — "Enzo Custom layout + Tympanus depth engine." Full,
// borderless background (no left/right panel split at all, per this
// round's explicit instruction) rendered by a single full-screen shader
// pass adapted from the real Tympanus DepthGallery repo — see
// HeroDepthField.tsx for exactly what was reused from it. scrollYProgress
// is smoothed through a spring (smoothScroll) for non-mechanical easing,
// and — new this round — its velocity is also tracked (scrollVelocity, via
// framer-motion's useVelocity) and handed to the shader, directly porting
// the Tympanus repo's velocity-reactive background technique rather than
// approximating it. Both MotionValues are read inside the shader's
// useFrame loop with `.get()`, never through React state.
export function Hero() {
  const [canRender3D, setCanRender3D] = useState(false)
  const [inView, setInView] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 45, damping: 20, mass: 0.6 })
  const scrollVelocity = useVelocity(smoothScroll)
  const contentY = useTransform(smoothScroll, [0, 1], [0, -50])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return
    const isSmallScreen = window.innerWidth < 768
    const lowEndDevice = (navigator.hardwareConcurrency ?? 8) <= 4
    const probe = document.createElement('canvas')
    const hasWebGL2 = !!probe.getContext('webgl2')
    if (hasWebGL2 && !(isSmallScreen && lowEndDevice)) {
      setCanRender3D(true)
    }
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const show3D = canRender3D && inView

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-luxury-navy-deep"
    >
      {/* The shader itself paints the full background — W1 REBALANCE: pure
          two-tone Midnight Navy, no espresso hand-off (navy is the brand
          identity and must dominate; espresso is a card/panel accent only
          now, never a section background) — the archipelago as a soft
          luminance hint, grain, and a velocity-reactive lift, all in one
          continuous pass, per this round's "harus terasa seperti satu ruang
          sinematik" (no separate panels or hard edges between layers).
          See HeroDepthField.tsx. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        {show3D && <HeroDepthField scrollProgress={smoothScroll} scrollVelocity={scrollVelocity} />}
      </div>

      {/* Fallback for reduced-motion / no-WebGL2 / low-end: the shader's
          own base gradient, reproduced as a static CSS gradient so there's
          still a cinematic backdrop, just without the animated map hint. */}
      {!show3D && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(165deg,_#0B1628_0%,_#0A1322_55%,_#0A1322_100%)]"
        />
      )}

      {/* Soft radial navy glow (W1 ART DIRECTION LOCK) — "cahaya kota yang
          dipantulkan" sitting in the upper field where the navy dominates,
          reinforcing the read without introducing a new object or panel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_30%_18%,_rgba(11,22,40,0.45)_0%,_rgba(10,19,34,0.30)_45%,_transparent_75%)]"
      />

      {/* Slightly darker (navy-toned, not flat black) on the left where the
          headline sits, easing off toward the right — legibility without a
          flat scrim. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#0A1322] via-[#0A1322]/70 to-[#0A1322]/25"
      />

      {/* Content — moves least (0.1x) of everything in the scene. */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ y: contentY }}
        className="relative z-10 px-6 md:px-10 lg:px-16"
      >
        <div className="max-w-xl">
          <motion.p variants={item} className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">
            {heroCopy.eyebrow}
          </motion.p>

          {/* Not part of the stagger — the headline is the LCP candidate
              once there's no hero image racing ahead of it, so it paints
              immediately at full opacity instead of waiting through a
              fade-in delay. Everything else still cascades in around it. */}
          <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl lg:text-7xl">
            {heroCopy.headline}
          </h1>

          <motion.p variants={item} className="mt-6 max-w-md font-luxury-sans text-base text-luxury-taupe md:text-lg">
            {heroCopy.subheadline}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <MagneticButton href="/#configurator" variant="primary">
              {heroCopy.primaryCta}
            </MagneticButton>
            <MagneticButton href="/#appointment" variant="ghost">
              {heroCopy.secondaryCta}
            </MagneticButton>
          </motion.div>

          <motion.ul variants={item} className="mt-14 flex max-w-lg flex-wrap items-center gap-x-8 gap-y-3">
            {heroCopy.trustStrip.map((label) => (
              <li key={label} className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe">
                {label}
              </li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  )
}
