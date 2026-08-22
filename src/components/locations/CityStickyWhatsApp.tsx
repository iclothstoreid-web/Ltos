'use client'

import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { CITY_BUSINESS, type CityConfig } from '@/lib/seo/cityConfig'
import { appendUtmNote, type UtmParams } from '@/lib/seo/utm'

interface CityStickyWhatsAppProps {
  city: CityConfig
  utm?: UtmParams
}

// Sprint W8-B §6 — "sticky CTA atau floating WhatsApp CTA pada location
// pages". Distinct from the existing StickyMobileCta.tsx (homepage-only,
// scroll-triggered, links to /design-studio) — this is a new, always-on
// floating button so it doesn't touch that shipped component. Visible on
// both mobile and desktop, since a floating WhatsApp button is a standard,
// always-available pattern on local-business sites, not just a mobile
// affordance.
export function CityStickyWhatsApp({ city, utm }: CityStickyWhatsAppProps) {
  const message = appendUtmNote(`Halo Tarda, saya di ${city.city} dan ingin konsultasi custom thobe.`, utm ?? {})
  const whatsappUrl = buildContentWhatsAppUrl(CITY_BUSINESS.whatsappInternational, message)

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-luxury-gold text-luxury-black shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition hover:brightness-110 hover:shadow-[0_0_24px_rgba(200,162,74,0.5)]"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-7 w-7">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.92C21.96 6.45 17.5 2 12.04 2Zm0 18.14h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.55 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.25 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.9 2.4 1.02 2.57.12.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29Z" />
      </svg>
    </a>
  )
}
