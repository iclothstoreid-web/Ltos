'use client'

import { useTranslations } from 'next-intl'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

type TrustBadgesSectionProps = {
  // Sprint W5-10 — added for landing-page reuse. The primary CTA stays
  // hardcoded to /book-appointment on purpose — this sprint's own CTA
  // consolidation rule keeps the primary conversion action constant
  // everywhere; only the secondary "Explore Fabrics" action is meaningful
  // to vary per page.
  secondaryCtaHref?: string
}

// Sprint W5-9 — Trust Badges & Premium Copywriting. Centered header, 3
// primary trust cards (article/ul/li, matching CraftsmanshipSection's
// convention), a compact secondary-badge row (a second ul, lighter pill
// treatment), a premium copywriting block, and a final CTA area — all
// nested under one h2, with h3s per sub-block rather than a second h2, to
// keep one-h2-per-section intact.
export function TrustBadgesSection({ secondaryCtaHref = '/fabric' }: TrustBadgesSectionProps = {}) {
  const t = useTranslations('home.trustBadges')
  const primaryCards = t.raw('primaryCards') as { title: string; description: string }[]
  const secondaryBadges = t.raw('secondaryBadges') as string[]

  return (
    <section id="trust-badges" aria-labelledby="trust-badges-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="trust-badges-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{t('subheadline')}</p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {primaryCards.map((card, i) => (
            <Reveal as="li" key={card.title} delay={i * 0.08}>
              <article className="h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-8">
                <h3 className="font-fraunces text-lg text-luxury-ivory">{card.title}</h3>
                <p className="mt-3 font-luxury-sans text-sm text-luxury-taupe">{card.description}</p>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.15} className="mt-10">
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {secondaryBadges.map((badge) => (
              <li
                key={badge}
                className="rounded-full border border-luxury-gold/40 px-4 py-1.5 font-luxury-sans text-xs uppercase tracking-[0.08em] text-luxury-gold"
              >
                {badge}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.2} className="mx-auto mt-16 max-w-2xl border-t border-luxury-gold/[0.14] pt-16 text-center">
          <h3 className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">{t('summary.heading')}</h3>
          <p className="mt-5 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{t('summary.body')}</p>
        </Reveal>

        <Reveal delay={0.25} className="mx-auto mt-16 max-w-xl border-t border-luxury-gold/[0.14] pt-16 text-center">
          <h3 className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">{t('finalCta.heading')}</h3>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{t('finalCta.subheadline')}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <MagneticButton href="/book-appointment" variant="primary">
              {t('finalCta.primaryCta')}
            </MagneticButton>
            <MagneticButton href={secondaryCtaHref} variant="ghost">
              {t('finalCta.secondaryCta')}
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
