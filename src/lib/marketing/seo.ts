import type { Metadata } from 'next'
import { faqCopy } from './copy'

// TODO_REAL_DATA — placeholder business details, replace before ship.
const BUSINESS = {
  name: 'Bespoke Tailor',
  url: 'https://ltos-local-tailor.vercel.app',
  addressLocality: 'Bandung',
  addressCountry: 'ID',
}

export const homepageMetadata: Metadata = {
  title: 'Bespoke Tailor — Custom Thobe, Crafted Exclusively for You',
  description:
    'Bespoke thobe, handcrafted in Bandung. A pattern formulated from your measurements alone, made from imported fabrics and finished by hand.',
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

// Sprint W0.1 — Body Profile Estimator landing page. Marketing/acquisition
// layer only ("W0 = Estimasi"); never confused with LTOS W4's fitter-
// verified Digital Body Profile ("W4 = Profil Terverifikasi").
export const bodyEstimatorMetadata: Metadata = {
  title: 'Cek Ukuran Thobe Gratis — Body Profile Estimator | Bespoke Tailor',
  description:
    'Dapatkan estimasi ukuran thobe, rekomendasi fit, dan body profile Anda dalam kurang dari 30 detik. Gratis, tanpa pengukuran manual.',
  openGraph: {
    title: 'Cek Ukuran Thobe Anda Gratis',
    description: 'Estimasi ukuran thobe berdasarkan tinggi, berat, dan usia — hasil dalam kurang dari 30 detik.',
    url: `${BUSINESS.url}/free-body-profile-estimator`,
    siteName: BUSINESS.name,
    type: 'website',
  },
  alternates: {
    canonical: `${BUSINESS.url}/free-body-profile-estimator`,
  },
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
