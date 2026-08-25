import type { Metadata } from 'next'
import { faqCopy } from './copy'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

// TODO_REAL_DATA — placeholder business details, replace before ship.
// Production Domain Migration audit — `url` used to duplicate
// FABRIC_SITE_ORIGIN's literal instead of importing it, so the two could
// (and did) drift out of sync. Now imports the one real source of truth.
const BUSINESS = {
  name: 'Bespoke Tailor',
  url: FABRIC_SITE_ORIGIN,
  addressLocality: 'Bogor',
  addressCountry: 'ID',
}

// LTOS Brand System Rollout — official horizontal-with-tagline lockup on
// the site's own dark brand background (public/brand/og-image.png,
// generated from public/brand/logo-horizontal-tagline.svg), 1200x630 per
// the OpenGraph/Twitter `summary_large_image` spec. Single shared constant
// so every metadata builder below points at the exact same asset.
const OG_IMAGE = {
  url: `${BUSINESS.url}/brand/tarda.svg`,
  width: 1200,
  height: 630,
  alt: `${BUSINESS.name} — Tarda`,
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
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bespoke Tailor — Custom Thobe, Crafted Exclusively for You',
    description: 'Designed around your body, your lifestyle, and your identity.',
    images: [OG_IMAGE.url],
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
//
// Sprint W0.5 §1 SEO audit — added the `robots` signal (matches the Fabric
// Explorer's explicit index/follow convention, buildFabricMetadata) and a
// `twitter` block. No `images` on either openGraph or twitter: this page
// has no real photography, only SVG/gradient illustration — a `summary`
// card needs no image, unlike `summary_large_image`, so this is a complete
// (not partial) Twitter Card rather than a placeholder pointing at a
// fabricated asset.
export const bodyEstimatorMetadata: Metadata = {
  title: 'Cek Ukuran Thobe Gratis — Body Profile Estimator | Bespoke Tailor',
  description:
    'Dapatkan estimasi ukuran thobe, rekomendasi fit, dan body profile Anda dalam kurang dari 30 detik. Gratis, tanpa pengukuran manual.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Cek Ukuran Thobe Anda Gratis',
    description: 'Estimasi ukuran thobe berdasarkan tinggi, berat, dan usia — hasil dalam kurang dari 30 detik.',
    url: `${BUSINESS.url}/free-body-profile-estimator`,
    siteName: BUSINESS.name,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cek Ukuran Thobe Anda Gratis',
    description: 'Estimasi ukuran thobe berdasarkan tinggi, berat, dan usia — hasil dalam kurang dari 30 detik.',
  },
  alternates: {
    canonical: `${BUSINESS.url}/free-body-profile-estimator`,
  },
}

// Sprint W4.5 §"SEO" — shared metadata builder for the 3 new navigation
// placeholder pages (/gallery, /journal, /book-appointment). Same shape as
// bodyEstimatorMetadata above, but `type: 'website'` rather than 'article'
// — these aren't editorial content (that's src/lib/content/seo.ts's
// buildArticleMetadata, used by the W0.5 guides), just simple pages.
export function buildSimplePageMetadata(params: { title: string; description: string; path: string }): Metadata {
  const url = `${BUSINESS.url}${params.path}`
  const fullTitle = `${params.title} | ${BUSINESS.name}`
  return {
    title: fullTitle,
    description: params.description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: fullTitle,
      description: params.description,
      url,
      siteName: BUSINESS.name,
      type: 'website',
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: params.description,
      images: [OG_IMAGE.url],
    },
    alternates: {
      canonical: url,
    },
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
