import type { Metadata } from 'next'
import { FABRIC_BRAND_NAME } from '@/lib/materials/seo'
import { CITY_BUSINESS, CITY_GEO_BANDUNG, CITY_SITE_ORIGIN, type CityConfig } from '@/lib/seo/cityConfig'

// Sprint W8-1, migrated to cityConfig.ts + keyword-targeted titles in
// W8-2/3 — metadata generator for /locations pages. Same
// title/description/canonical/OG/Twitter/robots shape as
// src/lib/marketing/seo.ts's buildSimplePageMetadata, extended with `geo.*`
// / ICBM meta tags via Next's `other` field (the typed Metadata object has
// no native geo support — these are legacy but still-requested meta tags
// for local SEO).
//
// `geo.position`/ICBM (precise lat/long) are only emitted when the config
// itself carries real coordinates (Bandung only) — this app has no second
// physical location to plot, and reusing the Bandung coordinates on a
// different city's page would misrepresent where that pin belongs.
function capitalizeWords(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function buildLocationMetadata(city: CityConfig): Metadata {
  const url = `${CITY_SITE_ORIGIN}/locations/${city.slug}`
  // city.keywordPrimary already IS the target keyword ("tailor bandung",
  // "custom thobe jakarta", ...) — titling it directly keeps the page title
  // aligned with what this page is actually trying to rank for, rather than
  // a generic template that ignores the keyword strategy in cityConfig.ts.
  const title = `${capitalizeWords(city.keywordPrimary)} | ${FABRIC_BRAND_NAME}`
  const description = `${city.hero.subheadline} ${city.trustStatement}`.slice(0, 300)

  const geoTags: Record<string, string> = {
    'geo.placename': city.city,
    'geo.region': `ID-${city.provinceIsoCode}`,
  }
  if (city.geo) {
    geoTags['geo.position'] = `${city.geo.latitude};${city.geo.longitude}`
    geoTags.ICBM = `${city.geo.latitude}, ${city.geo.longitude}`
  }

  return {
    title,
    description,
    keywords: [city.keywordPrimary, ...city.keywordSecondary],
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: FABRIC_BRAND_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    other: geoTags,
  }
}

export function buildLocationsHubMetadata(): Metadata {
  const url = `${CITY_SITE_ORIGIN}/locations`
  const title = `Lokasi Layanan — Custom Thobe di Seluruh Indonesia | ${FABRIC_BRAND_NAME}`
  const description = `${CITY_BUSINESS.name} — workshop bespoke tailoring di Bandung, melayani konsultasi dan pengiriman custom thobe ke kota-kota besar di Indonesia.`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: FABRIC_BRAND_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    other: {
      'geo.placename': CITY_BUSINESS.addressLocality,
      'geo.region': 'ID-JB',
      'geo.position': `${CITY_GEO_BANDUNG.latitude};${CITY_GEO_BANDUNG.longitude}`,
      ICBM: `${CITY_GEO_BANDUNG.latitude}, ${CITY_GEO_BANDUNG.longitude}`,
    },
  }
}
