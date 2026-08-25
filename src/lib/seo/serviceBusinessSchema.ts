import { ALL_AVAILABLE_LANGUAGES, type JsonLdSchema } from '@/lib/seo/schema'
import { CITY_BUSINESS, CITY_SITE_ORIGIN } from '@/lib/seo/cityConfig'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'

// Sprint W10 — Local SEO Layer for the 5 Revenue Landing Pages. Reuses the
// exact same real, already-verified business data every /locations page
// already emits (src/lib/seo/localBusiness.ts) rather than duplicating a
// second copy of the address/geo/whatsapp — CITY_BUSINESS and
// CITY_BUSINESS is this codebase's one source of truth.
//
// Same `@id` as buildLocationLocalBusinessSchema — every page describing
// this business (locations/* and these 5 new pages) shares one entity id,
// so search engines consolidate signals onto one real-world Tailor rather
// than reading them as separate businesses.
const BUSINESS_ID = `${CITY_SITE_ORIGIN}/#local-tailor-bandung`

// Real neighborhoods this Bandung workshop already serves, per the brief's
// Task 3 list — identical to cityConfig.ts's BANDUNG.localContext, framed
// the same honest way ("we serve clients from X", never a branch claim).
export const SERVICE_AREA_NAMES = ['Bandung'] as const

// Opening hours were NOT added here: the only source found for them during
// this sprint was a separate WordPress site that, at the time, happened to
// also be hosted at localtailor.id (see cityConfig.ts's domain note —
// production has since migrated to localtailor.id as this project's own
// domain, but that doesn't retroactively make an unverified third party's
// old opening-hours data this business's real hours) — publishing
// unverified hours as structured data risks a customer showing up when the
// workshop is actually closed. Add a real `openingHoursSpecification` here
// once the business confirms its actual hours directly, rather than
// guessing.
export function buildServiceLocalBusinessSchema(service: ServiceConfig): JsonLdSchema {
  const pageUrl = `${CITY_SITE_ORIGIN}/${service.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Tailor',
    '@id': BUSINESS_ID,
    name: CITY_BUSINESS.name,
    url: pageUrl,
    telephone: `+${CITY_BUSINESS.whatsappInternational}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CITY_BUSINESS.streetAddress,
      addressLocality: CITY_BUSINESS.addressLocality,
      addressRegion: CITY_BUSINESS.addressRegion,
      postalCode: CITY_BUSINESS.postalCode,
      addressCountry: CITY_BUSINESS.addressCountry,
    },
    // ServiceArea — the real neighborhoods this one Bandung workshop already
    // serves (Task 3), signaled the same schema.org-recommended way as
    // areaServed on every /locations page: never a second fabricated
    // address per area.
    areaServed: SERVICE_AREA_NAMES.map((name) => ({ '@type': 'City', name })),
    availableLanguage: ALL_AVAILABLE_LANGUAGES,
  }
}
