'use client'

import { useTranslations } from 'next-intl'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

// Sprint W5-4 — Quality Control & Delivery. Card-left / content-right, same
// convention as the sections before it. The experience card uses the plain
// gold-dash bullet (not GoldCheckMark) — these are "what's included," not
// pass/fail inspection points, so the checkmark motif stays specific to
// QualityControlSection.
export function DeliverySection() {
  const t = useTranslations('home.delivery')
  const experience = t.raw('experience') as string[]

  return (
    <section id="delivery" aria-labelledby="delivery-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <article aria-label={t('experienceLabel')} className="rounded-sm border border-luxury-gold/30 bg-luxury-charcoal/60 p-6 md:p-8">
            <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('experienceLabel')}</p>
            <ul className="mt-5 flex flex-col gap-4">
              {experience.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
                  <span className="font-luxury-sans text-sm text-luxury-ivory">{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>

        <Reveal delay={0.1}>
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="delivery-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">{t('subheadline')}</p>

          <blockquote className="mt-8 border-l-2 border-luxury-gold/40 pl-5">
            <p className="font-fraunces text-xl italic leading-snug text-luxury-ivory md:text-2xl">&ldquo;{t('statement')}&rdquo;</p>
          </blockquote>

          <MagneticButton href="/book-appointment" variant="primary" className="mt-8">
            {t('cta')}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
