'use client'

import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { CITY_BUSINESS } from '@/lib/seo/cityConfig'
import { appendUtmNote, type UtmParams } from '@/lib/seo/utm'
import { trackCTA } from '@/lib/analytics/cta'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'

interface ServiceHeroProps {
  service: ServiceConfig
  utm?: UtmParams
}

// Sprint W10 — same shape as CityHero.tsx (keyword-phrase chip row, real
// WhatsApp CTA with UTM-attributed message), typed against ServiceConfig
// instead of CityConfig. Design My Thobe still goes to /design-studio —
// this hero is the commercial-intent entry point, Design Studio remains
// the one real configurator.
export function ServiceHero({ service, utm }: ServiceHeroProps) {
  const whatsappMessage = appendUtmNote(service.whatsappMessage, utm ?? {})
  const whatsappUrl = buildContentWhatsAppUrl(CITY_BUSINESS.whatsappInternational, whatsappMessage)

  return (
    <section className="relative overflow-hidden bg-luxury-navy-deep px-6 py-24 md:px-10 md:py-32">
      <LuxuryGradientField variant="a" />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">{service.hero.eyebrow}</p>
          <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl md:text-6xl">
            {service.hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-luxury-sans text-base text-luxury-taupe md:text-lg">{service.hero.subheadline}</p>
        </Reveal>

        {service.hero.keywordPhrases.length > 0 && (
          <Reveal delay={0.05} className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {service.hero.keywordPhrases.map((phrase) => (
              <span
                key={phrase}
                className="rounded-full border border-luxury-gold/[0.14] px-4 py-1.5 font-luxury-sans text-[11px] uppercase tracking-[0.08em] text-luxury-gold/90"
              >
                {phrase}
              </span>
            ))}
          </Reveal>
        )}

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton
            href="/design-studio"
            variant="primary"
            onClick={() => trackCTA(`service_hero_design_studio_${service.slug}`, `/${service.slug}`, 'hero_primary', 'landing')}
          >
            Design My Thobe
          </MagneticButton>
          <MagneticButton
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            onClick={() => trackCTA(`service_hero_whatsapp_${service.slug}`, `/${service.slug}`, 'hero_secondary', 'landing')}
          >
            {service.ctaLabel}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
