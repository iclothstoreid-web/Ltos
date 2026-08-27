'use client'

import { useTranslations } from 'next-intl'
import { appointmentCopy } from '@/lib/marketing/copy'
import { garmentPhotos } from '@/lib/marketing/assets'
import { SlotImage, type SlotOverride } from '../shell/SlotImage'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

// Sprint W1 revision — Savile Row-style appointment presentation (Gieves &
// Hawkes composition reference: large still garment photography paired with
// generous whitespace and a quiet, editorial info column — not copied
// directly, just the proportion/hierarchy). Positioned right after the
// Hero so the appointment CTA is the most prominent thing on the page
// after the headline itself, per the revision brief's CTA-review note.
export function PrivateAppointment({ imageOverride = null }: { imageOverride?: SlotOverride | null }) {
  const t = useTranslations('booking')

  return (
    <section
      id="appointment"
      aria-labelledby="appointment-heading"
      className="grid grid-cols-1 bg-luxury-navy-deep lg:grid-cols-[45fr_55fr]"
    >
      <div className="relative aspect-[4/5] w-full lg:aspect-auto lg:min-h-[720px]">
        <SlotImage
          override={imageOverride}
          fallbackSrc={garmentPhotos.blackPinstripe}
          fallbackAlt={appointmentCopy.photoAlt}
          sizes="(min-width: 1024px) 45vw, 100vw"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-luxury-black/40 via-transparent to-transparent lg:bg-gradient-to-r" />
      </div>

      <div className="flex items-center px-6 py-20 md:px-16 lg:px-20">
        <Reveal className="max-w-md">
          <GoldAccentLine className="mb-6" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="appointment-heading" className="mt-5 font-fraunces text-4xl leading-[1.1] text-luxury-ivory md:text-5xl">
            {t('heading')}
          </h2>

          <p className="mt-8 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-gold">{t('location')}</p>
          <p className="mt-2 font-luxury-sans text-sm text-luxury-taupe">{t('address')}</p>

          <p className="mt-8 font-luxury-sans text-base leading-relaxed text-luxury-taupe">{t('body')}</p>

          <MagneticButton href="/book-appointment" variant="primary" className="mt-10">
            {t('cta')}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
