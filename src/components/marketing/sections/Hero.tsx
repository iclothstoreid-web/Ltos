'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useSpring, useTransform, useVelocity, type Variants } from 'framer-motion'
import { heroCopy } from '@/lib/marketing/copy'
import { MagneticButton } from '../shell/MagneticButton'
import { trackEvent } from '@/lib/analytics/tracker'
import { trackCTA } from '@/lib/analytics/cta'
import { GA4_EVENTS } from '@/lib/analytics/events'

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

    function checkCapability() {
      const isSmallScreen = window.innerWidth < 768
      const lowEndDevice = (navigator.hardwareConcurrency ?? 8) <= 4
      const probe = document.createElement('canvas')
      const hasWebGL2 = !!probe.getContext('webgl2')
      if (hasWebGL2 && !(isSmallScreen && lowEndDevice)) {
        setCanRender3D(true)
      }
    }

    // P0 — deferred to browser idle time (was: synchronous in the mount
    // effect). Setting canRender3D immediately on mount triggered the
    // HeroDepthField dynamic import right away, putting three.js's ~750KB
    // (uncompressed) parse/execute cost directly in the critical
    // hydration window on every page load. Idle-deferring it means the
    // static fallback (HeroImagePlaceholder) paints first, hydration and
    // interactivity finish uncontested, and the shader swaps in a beat
    // later once the browser actually has spare time — imperceptible in
    // practice, but off the critical path.
    const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined
    if (ric) {
      const id = ric(checkCapability, { timeout: 2000 })
      return () => window.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(checkCapability, 200)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    // Sprint W9-1 §2 — hero_view piggybacks on this section's own existing
    // visibility observer (already tracking `inView` for the 3D-render
    // gate) rather than mounting a second IntersectionObserver for the
    // same element. Fires once, the first time Hero becomes visible.
    let viewed = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && !viewed) {
          viewed = true
          trackEvent(GA4_EVENTS.heroView, {}, { pageType: 'landing' })
        }
      },
      { threshold: 0.1 }
    )
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
      {/* The shader itself paints the full background — W1R: Deep Espresso
          Atelier grading (espresso/walnut two-tone; navy is now an
          atmospheric accent only, never a section background) — the
          archipelago as a soft luminance hint, grain, and a
          velocity-reactive lift, all in one continuous pass, per this
          round's "harus terasa seperti satu ruang sinematik" (no separate
          panels or hard edges between layers). See HeroDepthField.tsx. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        {show3D && <HeroDepthField scrollProgress={smoothScroll} scrollVelocity={scrollVelocity} />}
      </div>

      {/* Fallback for reduced-motion / no-WebGL2 / low-end: the shader's
          own base gradient, reproduced as a static CSS gradient so there's
          still a cinematic backdrop, just without the animated map hint.
          W1R — Deep Espresso cinematic base (was Midnight Navy). */}
      {!show3D && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(135deg,_#151210_0%,_#1B1714_55%,_#221C18_100%)]"
        />
      )}

      {/* W1R — navy demoted from dominant tone to a very soft atmospheric
          glow, "seperti pantulan cahaya pada kain atau kaca" over the
          espresso base, not a background color in its own right. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_30%_18%,_rgba(11,22,40,0.22)_0%,_rgba(11,22,40,0.08)_30%,_transparent_60%)]"
      />

      {/* Slightly darker (espresso-toned) on the left where the headline
          sits, easing off toward the right — legibility without a flat
          scrim. W1R — espresso, not navy, keeps this "one material" with
          the rest of the site. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#151210] via-[#151210]/70 to-[#151210]/25"
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
            <MagneticButton
              href="/design-studio"
              variant="primary"
              onClick={() => {
                trackEvent(GA4_EVENTS.heroCtaClick, { cta_id: 'hero_design_my_thobe' }, { pageType: 'landing' })
                trackCTA('hero_design_my_thobe', '/', 'hero_primary', 'landing')
              }}
            >
              {heroCopy.primaryCta}
            </MagneticButton>
            <MagneticButton
              href="/book-appointment"
              variant="ghost"
              onClick={() => {
                trackEvent(GA4_EVENTS.heroCtaClick, { cta_id: 'hero_book_appointment' }, { pageType: 'landing' })
                trackCTA('hero_book_appointment', '/', 'hero_secondary', 'landing')
              }}
            >
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
