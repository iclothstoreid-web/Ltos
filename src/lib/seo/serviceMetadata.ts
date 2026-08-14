import type { Metadata } from 'next'
import { FABRIC_BRAND_NAME } from '@/lib/materials/seo'
import { CITY_GEO_BANDUNG, CITY_SITE_ORIGIN } from '@/lib/seo/cityConfig'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'

// Sprint W10 — metadata generator for the 5 Revenue Landing Pages, same
// shape as src/lib/seo/locationMetadata.ts (title/description/canonical/
// OG/Twitter/robots/geo meta), reused rather than re-invented. Every page
// has a real, always-present Bandung geo point (unlike city pages, which
// only carry `geo` for the one primary city) since all 5 of these pages
// describe the same one real workshop.
function capitalizeWords(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function buildServiceMetadata(service: ServiceConfig): Metadata {
  const url = `${CITY_SITE_ORIGIN}/${service.slug}`
  const title = `${capitalizeWords(service.keywordPrimary)} | ${FABRIC_BRAND_NAME}`
  const description = service.hero.subheadline.slice(0, 300)

  return {
    title,
    description,
    keywords: [service.keywordPrimary, ...service.keywordSecondary],
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
      'geo.placename': 'Bandung',
      'geo.region': 'ID-JB',
      'geo.position': `${CITY_GEO_BANDUNG.latitude};${CITY_GEO_BANDUNG.longitude}`,
      ICBM: `${CITY_GEO_BANDUNG.latitude}, ${CITY_GEO_BANDUNG.longitude}`,
    },
  }
}
