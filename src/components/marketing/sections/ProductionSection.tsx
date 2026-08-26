'use client'

import { useTranslations } from 'next-intl'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

type ProductionSectionProps = {
  ctaHref?: string
}

// Sprint W5-3 — Pattern Formulation & Production. Centered header + full-width
// grid, matching the WhyLocalTailor/FabricHighlight/BespokeProcessSection
// convention (rather than the 2-column split used by PatternFormulationSection)
// since this section carries two separate collections (workflow stages,
// metrics) plus a statement and CTA — more content than a narrow content
// column comfortably holds. No connecting rail on the workflow grid, unlike
// BespokeProcessSection's timeline, so the two "6-step" sections don't read
// as the same component twice — this one is a plain process grid, as named
// in the brief.
export function ProductionSection({ ctaHref = '/#craftsmanship' }: ProductionSectionProps = {}) {
  const t = useTranslations('home.production')
  const stages = t.raw('stages') as string[]
  const metrics = t.raw('metrics') as { label: string; detail?: string }[]

  return (
    <section id="production" aria-labelledby="production-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="production-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{t('subheadline')}</p>
        </Reveal>

        <ol className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((stage, i) => (
            <Reveal as="li" key={stage} delay={i * 0.06}>
              <article className="flex h-full flex-col items-center gap-3 rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-5 text-center">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-luxury-gold font-fraunces text-xs text-luxury-gold"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-luxury-sans text-xs uppercase tracking-[0.08em] text-luxury-ivory">{stage}</h3>
              </article>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.15} className="mt-16 border-y border-luxury-gold/[0.14] py-10">
          <ul className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {metrics.map((metric) => (
              <li key={metric.label} className="text-center">
                <p className="font-fraunces text-lg text-luxury-ivory md:text-xl">{metric.label}</p>
                {metric.detail && <p className="mt-1 font-luxury-sans text-xs text-luxury-taupe">{metric.detail}</p>}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.2} className="mt-14 text-center">
          <blockquote className="mx-auto max-w-xl border-l-2 border-luxury-gold/40 pl-5 text-left">
            <p className="font-fraunces text-xl italic leading-snug text-luxury-ivory md:text-2xl">&ldquo;{t('statement')}&rdquo;</p>
          </blockquote>

          <MagneticButton href={ctaHref} variant="primary" className="mt-10">
            {t('cta')}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
