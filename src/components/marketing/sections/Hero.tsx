'use client'

import { useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { MagneticButton } from '../shell/MagneticButton'
import BrandLogo from '@/components/brand/BrandLogo'
import { trackEvent } from '@/lib/analytics/tracker'
import { trackCTA } from '@/lib/analytics/cta'
import { GA4_EVENTS } from '@/lib/analytics/events'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

// LTOS Hero — Strict Visual Reference. `hidden` used to start every
// staggered child at opacity:0 and rely on Framer Motion's mount-time
// `animate="show"` transition to reveal it. That transition reliably
// fired in Chromium, but under WebKit (verified via Playwright's WebKit
// engine at both 390px and 1440px) it never resolved — the eyebrow, price
// callout, CTA row, and feature row all stayed at opacity:0 indefinitely,
// i.e. permanently invisible content on Safari/iPhone Safari/iPad Safari,
// exactly the browsers this task explicitly requires. The reference is a
// still composition with no indication an entrance animation is load-
// bearing to the design, so rather than debug a JS-timing dependency this
// content's visibility shouldn't have had in the first place, `hidden`
// now matches `show` — every child already renders at full opacity/
// position. The stagger transition still exists structurally (harmless if
// it fires) but visibility no longer depends on it firing at all.
const item: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

// LTOS Hero — Strict Visual Reference. Minimal line icons for the feature
// row, drawn to match the reference's own thin, single-weight, brass-toned
// mark style (not an icon library import — four bespoke glyphs, each
// literally describing its label: a woven swatch grid, a tailor's tape,
// a location thread/pin, and a pattern piece).
function FabricIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2.5 7.5h15M2.5 12.5h15M7.5 2.5v15M12.5 2.5v15" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function MeasureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="8" width="16" height="6" rx="1.2" transform="rotate(-18 10 11)" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M4.4 8.3l1 2M7 7.4l1.1 2.9M9.6 6.5l1 2M12.2 5.6l1.1 2.9M14.8 4.7l1 2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CraftedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 17.5s6-5.13 6-9.5a6 6 0 1 0-12 0c0 4.37 6 9.5 6 9.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <circle cx="10" cy="8" r="2.15" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function PatternIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="4.5" width="10" height="10" rx="1.3" stroke="currentColor" strokeWidth="1.1" />
      <path d="M7.5 9.5h10v6a1.3 1.3 0 0 1-1.3 1.3H8.8a1.3 1.3 0 0 1-1.3-1.3v-6Z" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  )
}

const FEATURE_ICONS = [FabricIcon, MeasureIcon, CraftedIcon, PatternIcon]

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
//
// LTOS Hero — Strict Visual Reference revision. The WebGL depth-field
// shader above is retired from this composition (HeroDepthField.tsx
// itself is untouched and still importable, just no longer mounted here):
// the reference is a still, photographic warm-walnut atelier backdrop,
// not an animated 3D scene, and a static texture is also the only way to
// guarantee the exact same background renders identically on every
// required browser (Chrome/Safari/iPhone Safari/iPad Safari/Edge/Firefox)
// without a WebGL2-capability fallback branch at all. Background is now
// public/textures/walnut-hero.svg — a procedural (feTurbulence grain over
// a linear gradient) walnut wood texture, darker on the left where the
// headline sits and warming toward the right, matching the reference's
// own "gelap di kiri, wood grain terlihat ke kanan" composition principle
// — see that file's own header comment for why this exists instead of
// reusing the pre-existing public/textures/walnut-grain.png (documented
// there as too low-contrast to read as wood on a dark background at any
// opacity).
export function Hero() {
  const t = useTranslations('hero')
  const trustStrip = t.raw('trustStrip') as string[]
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    // Sprint W9-1 §2 — hero_view fires once, the first time Hero becomes
    // visible. Unchanged from before — still the section's own
    // IntersectionObserver, just no longer shared with a 3D-render gate.
    let viewed = false
    const observer = new IntersectionObserver(
      ([entry]) => {
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

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-luxury-black"
    >
      {/* Real, procedural walnut wood atelier texture — see file-level
          comment above. object-cover so it fills the section at every
          breakpoint without distortion or visible tiling. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[url('/textures/walnut-hero.svg')] bg-cover bg-[center_35%]"
      />

      {/* Warm brass-toned light glow, "cahaya hangat" landing on the panel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_30%_18%,_rgba(200,162,74,0.16)_0%,_rgba(200,162,74,0.06)_30%,_transparent_60%)]"
      />

      {/* Deep Espresso on the left where the headline sits, easing off
          toward the right — legibility without a flat scrim. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#1C130F] via-[#1C130F]/65 to-[#1C130F]/10"
      />

      {/* Content */}
      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 px-6 py-28 md:px-10 lg:px-16">
        <div className="max-w-xl lg:max-w-3xl xl:max-w-4xl">
          <motion.p variants={item} className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">
            {t('eyebrow')}
          </motion.p>

          {/* Not part of the stagger — the headline is the LCP candidate,
              so it paints immediately at full opacity instead of waiting
              through a fade-in delay. Everything else still cascades in
              around it. font-handwritten (Caveat) replaces the previous
              font-fraunces: that variable was never actually defined on
              this route tree (see src/app/layout.tsx's comment) so it was
              silently falling back to the browser's generic serif — the
              exact "kaku/formal, terasa AI-generated" result this task
              asked to move away from. */}
          <h1 className="relative mt-5 font-handwritten text-6xl font-semibold leading-[1.05] text-luxury-ivory sm:text-7xl lg:text-[5.5rem] lg:leading-[1.02]">
            <span className="block">{t('headline.line1')}</span>
            <span className="relative inline-block">
              {t('headline.line2')}
              <svg
                aria-hidden="true"
                viewBox="0 0 320 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full text-luxury-gold sm:-bottom-3"
              >
                <path d="M2 8.5C60 2.5 180 2.5 318 9.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>

          <div className="mt-9 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between lg:mt-11">
            <motion.p variants={item} className="max-w-md font-luxury-sans text-base text-luxury-taupe md:text-lg">
              {t('subheadline')}
            </motion.p>

            {/* Price callout — handwritten accent, deliberately small and
                off to the side so it never competes with the headline as
                the Lead. A short curved connector (matching the
                reference's own arrow-from-headline-to-price) ties it back
                visually without a hard box/card around it. */}
            <motion.div variants={item} className="flex items-start gap-2 sm:mt-1 sm:shrink-0 sm:pl-4">
              <svg aria-hidden="true" viewBox="0 0 40 40" className="mt-1 hidden h-8 w-8 shrink-0 text-luxury-gold/80 sm:block">
                <path
                  d="M4 4c4 10 4 20 30 30"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                  markerEnd="url(#priceArrowHead)"
                />
                <defs>
                  <marker id="priceArrowHead" markerWidth="7" markerHeight="7" refX="3.2" refY="3.2" orient="auto">
                    <path d="M0 0 L6 3.2 L0 6.4 Z" fill="currentColor" />
                  </marker>
                </defs>
              </svg>
              <p className="font-handwritten leading-tight text-luxury-gold">
                <span className="block text-lg sm:text-xl">{t('priceCallout.eyebrow')}</span>
                <span className="block text-2xl font-semibold sm:text-3xl">{t('priceCallout.price')}</span>
              </p>
            </motion.div>
          </div>

          <motion.div variants={item} className="mt-9 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center lg:mt-10">
            <MagneticButton
              href="/design-studio"
              variant="primary"
              onClick={() => {
                trackEvent(GA4_EVENTS.heroCtaClick, { cta_id: 'hero_design_my_thobe' }, { pageType: 'landing' })
                trackCTA('hero_design_my_thobe', '/', 'hero_primary', 'landing')
              }}
            >
              {t('primaryCta')}
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </MagneticButton>
            <MagneticButton
              href="/book-appointment"
              variant="ghost"
              onClick={() => {
                trackEvent(GA4_EVENTS.heroCtaClick, { cta_id: 'hero_book_appointment' }, { pageType: 'landing' })
                trackCTA('hero_book_appointment', '/', 'hero_secondary', 'landing')
              }}
            >
              {t('secondaryCta')}
            </MagneticButton>
          </motion.div>

          <motion.ul variants={item} className="mt-12 grid grid-cols-2 gap-x-4 gap-y-5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-0 lg:mt-16">
            {trustStrip.map((label, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length]
              return (
                <li key={label} className="flex min-w-0 items-center sm:contents">
                  <span className="flex min-w-0 items-center gap-2 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe sm:whitespace-nowrap">
                    <Icon className="h-[18px] w-[18px] shrink-0 text-luxury-gold/90" />
                    {label}
                  </span>
                  {i < trustStrip.length - 1 && <span className="mx-4 hidden text-luxury-taupe/40 sm:inline lg:mx-5">|</span>}
                </li>
              )
            })}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  )
}
