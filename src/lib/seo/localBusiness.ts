import { ALL_AVAILABLE_LANGUAGES, type JsonLdSchema } from '@/lib/seo/schema'
import { CITY_BUSINESS, CITY_GEO_BANDUNG, CITY_SITE_ORIGIN, type CityConfig } from '@/lib/seo/cityConfig'

// Sprint W8-1, migrated to cityConfig.ts in W8-2/3 — LocalBusiness schema
// generator for /locations pages.
//
// Local Tailor has exactly one physical location (the Bandung workshop).
// The other 4 city routes (Jakarta/Bekasi/Tangerang/Surabaya) are
// service-area landing pages, not branches — this generator always emits
// the one real Bandung `address` and signals per-city targeting through
// `areaServed` instead. Emitting a fabricated `address` for a city with no
// physical presence would be a fake-local-listing signal, exactly the kind
// of thing Google's Business Profile guidelines and local-SEO best
// practice explicitly prohibit — schema.org's own recommended pattern for
// a single-location service-area business is one LocalBusiness + areaServed,
// not one LocalBusiness per served city.
//
// Every page's schema shares the same `@id` (the canonical business URL) —
// they all describe the same real-world entity, just from different pages.
const BUSINESS_ID = `${CITY_SITE_ORIGIN}/#local-tailor-bandung`

export function buildLocationLocalBusinessSchema(city: CityConfig): JsonLdSchema {
  const pageUrl = `${CITY_SITE_ORIGIN}/locations/${city.slug}`

  return {
    '@context': 'https://schema.org',
    // schema.org/Tailor (a Store subtype) — more accurate than ClothingStore
    // for a made-to-order bespoke tailoring business, which sells no
    // off-the-shelf inventory.
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
    // Only present when the config itself carries real coordinates
    // (Bandung only) — a service-area city page reusing the Bandung geo
    // point would visually imply a pin in that city on a map card, which
    // is exactly the fabricated-local-presence signal this generator
    // otherwise avoids.
    ...(city.geo
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: city.geo.latitude,
            longitude: city.geo.longitude,
          },
        }
      : {}),
    areaServed: {
      '@type': 'City',
      name: city.city,
    },
    availableLanguage: ALL_AVAILABLE_LANGUAGES,
  }
}

// Hub page (`/locations`) — one entity, areaServed as the full list of
// cities this business actually has a landing page for. `priceRange` is
// deliberately never set anywhere in this module: every garment is
// made-to-order and quoted per consultation (see
// src/lib/materials/seo.ts's documented reasoning for the same choice on
// Product schema) — a fabricated `$$` estimate would misrepresent that.
export function buildLocationsHubLocalBusinessSchema(cities: CityConfig[]): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Tailor',
    '@id': BUSINESS_ID,
    name: CITY_BUSINESS.name,
    url: `${CITY_SITE_ORIGIN}/locations`,
    telephone: `+${CITY_BUSINESS.whatsappInternational}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CITY_BUSINESS.streetAddress,
      addressLocality: CITY_BUSINESS.addressLocality,
      addressRegion: CITY_BUSINESS.addressRegion,
      postalCode: CITY_BUSINESS.postalCode,
      addressCountry: CITY_BUSINESS.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CITY_GEO_BANDUNG.latitude,
      longitude: CITY_GEO_BANDUNG.longitude,
    },
    areaServed: cities.map((city) => ({ '@type': 'City', name: city.city })),
    availableLanguage: ALL_AVAILABLE_LANGUAGES,
  }
}
