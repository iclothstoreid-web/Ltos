import type { Metadata } from 'next'
import { FABRIC_BRAND_NAME } from '@/lib/materials/seo'
import { LOCATION_BUSINESS, LOCATION_GEO, LOCATION_SITE_ORIGIN, type LocationConfig } from '@/lib/seo/locations'

// Sprint W8-1 — metadata generator for /locations pages. Same
// title/description/canonical/OG/Twitter/robots shape as
// src/lib/marketing/seo.ts's buildSimplePageMetadata, extended with `geo.*`
// / ICBM meta tags via Next's `other` field (the typed Metadata object has
// no native geo support — these are legacy but still-requested meta tags
// for local SEO).
//
// `geo.position`/ICBM (precise lat/long) are only emitted for the Bandung
// page — the one page describing the real physical address. City pages for
// Jakarta/Bekasi/Tangerang/Surabaya get `geo.placename`/`geo.region` only
// (the city/province being targeted), never a lat/long — this app has no
// second physical location to plot, and reusing the Bandung coordinates on
// a different city's page would misrepresent where that pin belongs.
export function buildLocationMetadata(location: LocationConfig): Metadata {
  const url = `${LOCATION_SITE_ORIGIN}/locations/${location.slug}`
  const title = `Custom Thobe ${location.cityName} | ${FABRIC_BRAND_NAME}`
  const description = `${location.heroSubheadline} ${location.trustStatement}`.slice(0, 300)

  const geoTags: Record<string, string> = {
    'geo.placename': location.cityName,
    'geo.region': `ID-${location.provinceIsoCode}`,
  }
  if (location.isPrimary) {
    geoTags['geo.position'] = `${LOCATION_GEO.latitude};${LOCATION_GEO.longitude}`
    geoTags.ICBM = `${LOCATION_GEO.latitude}, ${LOCATION_GEO.longitude}`
  }

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
    other: geoTags,
  }
}

export function buildLocationsHubMetadata(): Metadata {
  const url = `${LOCATION_SITE_ORIGIN}/locations`
  const title = `Lokasi Layanan — Custom Thobe di Seluruh Indonesia | ${FABRIC_BRAND_NAME}`
  const description = `${LOCATION_BUSINESS.name} — workshop bespoke tailoring di Bandung, melayani konsultasi dan pengiriman custom thobe ke kota-kota besar di Indonesia.`

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
      'geo.placename': LOCATION_BUSINESS.addressLocality,
      'geo.region': 'ID-JB',
      'geo.position': `${LOCATION_GEO.latitude};${LOCATION_GEO.longitude}`,
      ICBM: `${LOCATION_GEO.latitude}, ${LOCATION_GEO.longitude}`,
    },
  }
}
