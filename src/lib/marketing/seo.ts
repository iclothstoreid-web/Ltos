import type { Metadata } from 'next'
import { faqCopy } from './copy'

// TODO_REAL_DATA — placeholder business details, replace before ship.
const BUSINESS = {
  name: 'Bespoke Tailor',
  url: 'https://ltos-local-tailor.vercel.app',
  addressLocality: 'Bogor',
  addressCountry: 'ID',
}

export const homepageMetadata: Metadata = {
  title: 'Bespoke Tailor — Custom Thobe, Crafted Exclusively for You',
  description:
    'Bespoke thobe, handcrafted in Bogor. A pattern formulated from your measurements alone, made from imported fabrics and finished by hand.',
  openGraph: {
    title: 'Bespoke Tailor — Custom Thobe, Crafted Exclusively for You',
    description: 'Designed around your body, your lifestyle, and your identity.',
    url: BUSINESS.url,
    siteName: BUSINESS.name,
    type: 'website',
  },
  alternates: {
    canonical: BUSINESS.url,
  },
}

export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS.name,
    url: BUSINESS.url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.addressLocality,
      addressCountry: BUSINESS.addressCountry,
    },
    description: 'Bespoke thobe tailoring — pattern formulation, measurement, and handcrafted production.',
  }
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS.name,
    url: BUSINESS.url,
  }
}

export function buildFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqCopy.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
