'use client'

import { useTranslations } from 'next-intl'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { GoldCheckMark } from '../placeholders/GoldCheckMark'

type QualityControlSectionProps = {
  // Sprint W5-10 — repointed from /#craftsmanship to /#why: that section
  // never had explicit QC content, while WhyLocalTailor makes the
  // quality-differentiation case directly; also thins out the
  // /#craftsmanship cluster (was 6 of 13 sections pointing there).
  ctaHref?: string
}

// Sprint W5-4 — Quality Control & Delivery. Card-left / content-right,
// same convention as Consultation/Measurement/Pattern Formulation. The
// checklist uses GoldCheckMark (not the plain gold-dash bullet used
// elsewhere) since each item is literally a pass/verified inspection
// point — the one place on the homepage that motif is warranted.
export function QualityControlSection({ ctaHref = '/#why' }: QualityControlSectionProps = {}) {
  const t = useTranslations('home.qualityControl')
  const checklist = t.raw('checklist') as string[]
  const pointCount = checklist.length

  return (
    <section id="quality-control" aria-labelledby="quality-control-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <article aria-label="Inspection checklist" className="rounded-sm border border-luxury-gold/30 bg-luxury-charcoal/60 p-6 md:p-8">
            <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('pointInspection', { count: pointCount })}</p>
            <ul className="mt-5 flex flex-col gap-4">
              {checklist.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <GoldCheckMark />
                  <span className="font-luxury-sans text-sm text-luxury-ivory">{point}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>

        <Reveal delay={0.1}>
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="quality-control-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">{t('subheadline')}</p>

          <blockquote className="mt-8 border-l-2 border-luxury-gold/40 pl-5">
            <p className="font-fraunces text-xl italic leading-snug text-luxury-ivory md:text-2xl">&ldquo;{t('statement')}&rdquo;</p>
          </blockquote>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-luxury-gold/40 px-4 py-1.5 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold">
            <GoldCheckMark className="h-4 w-4" />
            {t('trustCallout')}
          </p>

          <MagneticButton href={ctaHref} variant="primary" className="mt-8">
            {t('cta')}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
