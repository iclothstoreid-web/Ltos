import { trackEvent } from './tracker'
import { GA4_EVENTS } from './events'
import type { PageType } from './types'
import { SERVICE_CONFIGS } from '@/lib/seo/serviceConfig'

// Sprint W9-1 §4 — CTA Tracking System. Every CTA on the site gets a
// stable `id` from this registry, so the CRO dashboard's "CTA leaderboard"
// (src/components/analytics/) can group clicks by a known id instead of
// free-text button labels that drift with copy changes.

export interface CtaDefinition {
  id: string
  label: string
  /** Route this CTA lives on (or the shared component name for CTAs reused across many pages, e.g. "Nav"). */
  page: string
}

// Real CTAs already shipped across the site — not an aspirational list.
// New CTAs should get an entry here as they're added so trackCTA() calls
// always reference a known id.
export const CTA_REGISTRY: CtaDefinition[] = [
  { id: 'hero_design_my_thobe', label: 'Design My Thobe', page: '/' },
  { id: 'hero_book_appointment', label: 'Book a Private Appointment', page: '/' },
  { id: 'nav_book_appointment', label: 'Book Appointment', page: 'Nav' },
  { id: 'final_cta_design_my_thobe', label: 'Design My Thobe', page: '/' },
  { id: 'final_cta_chat_tailor', label: 'Chat with Tailor', page: '/' },
  { id: 'ds_hero_book_video_call', label: 'Book Free Video Call', page: '/design-studio' },
  { id: 'ds_hero_explore_studio', label: 'Explore Design Studio', page: '/design-studio' },
  { id: 'ds_booking_cta_video_call', label: 'Book Free Video Call', page: '/design-studio' },
  { id: 'ds_homepage_preview_explore', label: 'Explore Design Studio', page: '/' },
  { id: 'fabric_explore_all', label: 'Explore All Fabrics', page: '/' },
  { id: 'fabric_detail_estimate', label: 'Estimasi Harga di Design Studio', page: '/fabric/[category]/[slug]' },
  { id: 'gallery_design_your_own', label: 'Design Your Own', page: '/gallery' },
  { id: 'book_appointment_whatsapp', label: 'Chat on WhatsApp', page: '/book-appointment' },
  { id: 'location_cta_whatsapp', label: 'Chat on WhatsApp', page: '/locations/[city]' },
  { id: 'location_sticky_whatsapp', label: 'Floating WhatsApp', page: '/locations/[city]' },
  { id: 'contact_chat_whatsapp', label: 'Chat on WhatsApp', page: '/contact' },
  { id: 'contact_get_directions', label: 'Get Directions', page: '/contact' },
  { id: 'review_write_google', label: 'Tulis Ulasan di Google', page: 'GoogleReviewCTA' },
  // Sprint W10 — Revenue Landing Pages (RevenueLandingPage.tsx). Unlike
  // /locations/[city]'s CTAs (one shared id across all cities), each
  // service page's CTA ids embed the slug directly (see ServiceHero.tsx,
  // ServiceCTA.tsx, ServiceStickyWhatsApp.tsx), so the registry needs one
  // entry per id per page, not one generic entry per CTA type. Generated
  // from SERVICE_CONFIGS so a new landing page can never silently ship
  // CTAs missing from this registry.
  ...SERVICE_CONFIGS.flatMap((service): CtaDefinition[] => [
    { id: `service_hero_design_studio_${service.slug}`, label: 'Explore Design Studio', page: `/${service.slug}` },
    { id: `service_hero_whatsapp_${service.slug}`, label: 'Chat on WhatsApp', page: `/${service.slug}` },
    { id: `service_cta_whatsapp_${service.slug}`, label: 'Chat on WhatsApp', page: `/${service.slug}` },
    { id: `service_sticky_whatsapp_${service.slug}`, label: 'Floating WhatsApp', page: `/${service.slug}` },
  ]),
]

export function getCtaDefinition(id: string): CtaDefinition | undefined {
  return CTA_REGISTRY.find((cta) => cta.id === id)
}

/**
 * Sprint W9-1 §4's required helper. `page` is the route (or shared
 * component name) the CTA was clicked from — pass the CTA_REGISTRY id's
 * own `page` field for consistency, or override if the same id is
 * genuinely reused on multiple routes (e.g. a shared Nav CTA).
 */
export function trackCTA(id: string, page: string, position: string, pageType?: PageType): void {
  trackEvent(
    GA4_EVENTS.click,
    {
      cta_id: id,
      cta_label: getCtaDefinition(id)?.label,
      cta_page: page,
      cta_position: position,
    },
    { pageType }
  )
}
