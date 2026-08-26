'use client'

import { useTranslations } from 'next-intl'
import { Reveal } from '../shell/Reveal'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { buildFaqSchema } from '@/lib/marketing/seo'
import { JsonLd } from '@/components/seo/JsonLd'

// Built on native <details>/<summary> — crawlable and keyboard-accessible
// without JS, per PLAN_SPRINT_W1_HOMEPAGE_LUXURY_BLUEPRINT.md §8. The
// FAQPage JSON-LD below is intentionally still generated from the static,
// English faqCopy.items in buildFaqSchema() (search engines index one
// canonical structured-data language) — only the *visible* FAQ list below
// reads from the active locale's `faq.items`.
export function Faq() {
  const t = useTranslations('faq')
  const items = t.raw('items') as { question: string; answer: string }[]
  const schema = buildFaqSchema()

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-luxury-navy px-6 py-24 md:px-10 [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
    >
      <JsonLd data={schema} />

      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="faq-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-luxury-gold/[0.14]">
          {items.map((item, i) => (
            <Reveal key={item.question} delay={i * 0.05}>
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between font-luxury-sans text-sm text-luxury-ivory">
                  <h3 className="font-fraunces text-lg font-normal">{item.question}</h3>
                  <span aria-hidden="true" className="ml-4 shrink-0 text-luxury-gold transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
