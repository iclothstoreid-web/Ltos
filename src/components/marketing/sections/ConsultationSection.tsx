'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { consultationCopy } from '@/lib/marketing/copy'
import { garmentPhotos } from '@/lib/marketing/assets'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

// Sprint W5-2 — Consultation & Measurement. Image-left / content-right,
// matching the established two-column convention already used by
// ConfiguratorPreview and PrivateAppointment rather than a new layout.
// Reusable standalone (no homepage-only state), so other landing pages
// can drop it in as-is.
export function ConsultationSection() {
  const t = useTranslations('home.consultation')
  const bullets = t.raw('bullets') as string[]

  return (
    <section id="consultation" aria-labelledby="consultation-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
          <Image
            src={garmentPhotos.maroonPiping}
            alt={consultationCopy.photoAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 ring-1 ring-inset ring-luxury-gold/10" />
        </Reveal>

        <Reveal delay={0.1}>
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="consultation-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">{t('subheadline')}</p>

          <article aria-label="What your consultation includes" className="mt-8 rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6">
            <ul className="flex flex-col gap-4">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
                  <span className="font-luxury-sans text-sm text-luxury-ivory">{bullet}</span>
                </li>
              ))}
            </ul>
          </article>

          <MagneticButton href="/book-appointment" variant="primary" className="mt-8">
            {t('cta')}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
