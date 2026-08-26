'use client'

import { useTranslations } from 'next-intl'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

type CraftsmanshipSectionProps = {
  ctaHref?: string
}

// Sprint W5-5 — Craftsmanship & Workshop. Centered header + full-width card
// grid, matching the WhyLocalTailor/FabricHighlight/ProductionSection
// convention rather than the 2-column split used by Consultation/Measurement/
// Pattern Formulation — this section is a flat set of 4 equal cards with no
// accompanying photo, so the grid convention fits better.
export function CraftsmanshipSection({ ctaHref = '/#craftsmanship' }: CraftsmanshipSectionProps = {}) {
  const t = useTranslations('home.craftsmanshipDetails')
  const cards = t.raw('cards') as { title: string; description: string }[]

  return (
    <section id="craftsmanship-details" aria-labelledby="craftsmanship-details-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="craftsmanship-details-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{t('subheadline')}</p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <Reveal as="li" key={card.title} delay={i * 0.08}>
              <article className="h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6">
                <h3 className="font-fraunces text-lg text-luxury-ivory">{card.title}</h3>
                <p className="mt-3 font-luxury-sans text-sm text-luxury-taupe">{card.description}</p>
              </article>
            </Reveal>
          ))}
        </ul>

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
