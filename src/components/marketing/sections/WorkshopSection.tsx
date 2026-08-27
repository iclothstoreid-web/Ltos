'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { workshopCopy } from '@/lib/marketing/copy'
import { garmentPhotos, fabricPhotos } from '@/lib/marketing/assets'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { SlotImage, type SlotOverride } from '../shell/SlotImage'

type WorkshopSectionProps = {
  // Sprint DS-UX Scope B — Owner-managed "craftsmanship" homepage slot
  // overrides the main photo only (the inset fabric macro stays built-in).
  imageOverride?: SlotOverride | null
  // Sprint W5-10 — added; this section was the one single-CTA section
  // still hardcoded (no override), inconsistent with its siblings.
  // Defaults to /gallery, not /#craftsmanship — GallerySection has a
  // literal "Workshop Process" category, a closer content match, and this
  // also thins out the /#craftsmanship cluster.
  ctaHref?: string
}

// Sprint W5-5 — Craftsmanship & Workshop. Editorial visual composed from two
// real, already-catalogued photos (garmentPhotos.navy + a fabricPhotos macro
// shot as an offset inset) rather than a single flat image or an illustrated
// placeholder — no workshop-interior photography exists in assets.ts, and
// the brief explicitly says not to add a new stock image, so this reuses
// what's real and on-brand. Card-left / content-right, same convention as
// the section before it.
export function WorkshopSection({ ctaHref = '/gallery', imageOverride = null }: WorkshopSectionProps = {}) {
  const t = useTranslations('home.workshop')
  const pillars = t.raw('pillars') as string[]

  return (
    <section id="workshop" aria-labelledby="workshop-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal className="relative aspect-[4/5] w-full">
          <div className="absolute inset-0 overflow-hidden rounded-sm">
            <SlotImage
              override={imageOverride}
              fallbackSrc={garmentPhotos.navy}
              fallbackAlt={workshopCopy.photoAlt}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div aria-hidden="true" className="absolute inset-0 ring-1 ring-inset ring-luxury-gold/10" />
          </div>
          <div className="absolute -bottom-6 -right-6 h-32 w-32 overflow-hidden rounded-sm border-2 border-luxury-navy-deep shadow-[0_8px_28px_rgba(0,0,0,0.45)] sm:h-40 sm:w-40">
            <Image src={fabricPhotos.woolBlendTwill} alt={workshopCopy.fabricAlt} fill sizes="160px" className="object-cover" />
            <div aria-hidden="true" className="absolute inset-0 ring-1 ring-inset ring-luxury-gold/25" />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:pl-6">
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="workshop-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">{t('subheadline')}</p>

          <article aria-label={t('pillarsLabel')} className="mt-8 rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6">
            <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{t('pillarsLabel')}</p>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <li key={pillar} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
                  <span className="font-luxury-sans text-sm text-luxury-ivory">{pillar}</span>
                </li>
              ))}
            </ul>
          </article>

          <blockquote className="mt-8 border-l-2 border-luxury-gold/40 pl-5">
            <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{t('authenticityLabel')}</p>
            <p className="mt-2 font-fraunces text-lg italic leading-snug text-luxury-ivory md:text-xl">&ldquo;{t('authenticityCallout')}&rdquo;</p>
          </blockquote>

          <MagneticButton href={ctaHref} variant="primary" className="mt-8">
            {t('cta')}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
