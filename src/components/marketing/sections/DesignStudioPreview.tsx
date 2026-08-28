'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { ExperienceCards, type ExperienceCardItem } from '@/components/design-studio/ExperienceCards'

// LTOS i18n — this section's source copy was authored directly in
// Indonesian (Sprint Y), unlike most other homepage sections whose source
// is src/lib/marketing/copy.ts's English. Its Indonesian wording is
// preserved verbatim as the `id` locale's translation; the experience card
// data now comes from `home.digitalBespoke.experiences` (translated per
// locale) instead of the shared DIGITAL_BESPOKE_EXPERIENCES constant, so
// this preview no longer imports it — /design-studio's own page keeps using
// that constant unchanged (out of this pass's scope, still Indonesian-only).
export function DesignStudioPreview() {
  const t = useTranslations('home.digitalBespoke')
  const experiences = t.raw('experiences') as ExperienceCardItem[]

  return (
    <section id="digital-bespoke-tailoring" aria-labelledby="design-studio-preview-heading" className="bg-luxury-navy px-6 pt-24 md:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="design-studio-preview-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-luxury-sans text-sm text-luxury-taupe">{t('body')}</p>
        </Reveal>
      </div>

      <ExperienceCards heading={t('experiencesHeading')} items={experiences} audienceLabel={t('audienceLabel')} />

      <div className="mx-auto max-w-3xl pb-24 text-center">
        <Reveal>
          <MagneticButton href="/design-studio" variant="primary">
            {t('cta')}
          </MagneticButton>
        </Reveal>

        {/* National SEO (P0-3) — the homepage path into the two national
            commercial pillars. Integrated into this existing "bespoke from
            anywhere" section rather than adding a new homepage section. */}
        <Reveal>
          <p className="mt-8 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe/80">{t('nationalLinksLabel')}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/custom-thobe-indonesia"
              className="rounded-full border border-luxury-gold/[0.16] px-4 py-2 font-luxury-sans text-[11px] uppercase tracking-[0.1em] text-luxury-taupe transition hover:border-luxury-gold/60 hover:text-luxury-gold"
            >
              {t('pillarCustomThobe')}
            </Link>
            <Link
              href="/bespoke-tailor-indonesia"
              className="rounded-full border border-luxury-gold/[0.16] px-4 py-2 font-luxury-sans text-[11px] uppercase tracking-[0.1em] text-luxury-taupe transition hover:border-luxury-gold/60 hover:text-luxury-gold"
            >
              {t('pillarBespokeTailor')}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
