'use client'

import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { CITY_BUSINESS } from '@/lib/seo/cityConfig'
import { appendUtmNote, type UtmParams } from '@/lib/seo/utm'
import { trackCTA } from '@/lib/analytics/cta'
import { trackEvent } from '@/lib/analytics/tracker'
import { GA4_EVENTS } from '@/lib/analytics/events'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'

interface ServiceCTAProps {
  service: ServiceConfig
  utm?: UtmParams
}

// Sprint W10 — strong closing WhatsApp CTA, same shape as CityCTA.tsx.
// Also fires GA4_EVENTS.ctaClick (consultation_cta_click) alongside the
// generic cta_click trackCTA fires — this is the page's primary
// consultation conversion point, so it gets the named taxonomy event too
// (same pattern TrackedMagneticButton established in Sprint W9-1).
export function ServiceCTA({ service, utm }: ServiceCTAProps) {
  const message = appendUtmNote(service.whatsappMessage, utm ?? {})
  const whatsappUrl = buildContentWhatsAppUrl(CITY_BUSINESS.whatsappInternational, message)

  return (
    <section aria-labelledby="service-cta-heading" className="border-y border-luxury-gold/[0.14] bg-luxury-navy-deep px-6 py-24 text-center md:px-10">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <GoldAccentLine className="mx-auto mb-4" />
          <h2 id="service-cta-heading" className="font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Siap Memulai {service.hero.eyebrow}?
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
            Konsultasi awal via WhatsApp — tidak dikenakan biaya. Anda hanya membayar untuk garmen yang benar-benar dipesan.
          </p>
          <div className="mt-8">
            <MagneticButton
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              onClick={() => {
                trackCTA(`service_cta_whatsapp_${service.slug}`, `/${service.slug}`, 'final_cta', 'landing')
                trackEvent(GA4_EVENTS.ctaClick, { cta_id: `service_cta_whatsapp_${service.slug}` }, { pageType: 'landing' })
              }}
            >
              {service.ctaLabel}
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
