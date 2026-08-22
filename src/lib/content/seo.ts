import type { Metadata } from 'next'
import { FABRIC_BRAND_NAME, FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

// Sprint W0.5 — SEO Content Cluster. Reuses the Fabric Explorer's own
// origin/brand constants (src/lib/materials/seo.ts) rather than declaring a
// third copy of the same URL — src/lib/marketing/seo.ts's BUSINESS.url and
// materials' FABRIC_SITE_ORIGIN are already the same string maintained in
// two places; this module doesn't add a fourth.

// These pages are genuinely published today — not a fabricated historical
// date. If a page's content is substantively rewritten later, update its
// own PUBLISHED_DATE constant in articles.ts rather than this shared one.
export const CONTENT_PUBLISHED_DATE = '2026-08-12'

export function buildArticleMetadata(params: { title: string; description: string; slug: string }): Metadata {
  const url = `${FABRIC_SITE_ORIGIN}/${params.slug}`
  const fullTitle = `${params.title} | ${FABRIC_BRAND_NAME}`
  return {
    title: fullTitle,
    description: params.description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: fullTitle,
      description: params.description,
      url,
      siteName: FABRIC_BRAND_NAME,
      type: 'article',
    },
    // No `images` — no real photography exists for these guide pages yet.
    // `summary` card needs no image, unlike `summary_large_image`; omitting
    // rather than pointing at a fabricated asset.
    twitter: {
      card: 'summary',
      title: fullTitle,
      description: params.description,
    },
  }
}

// Article schema — one per content-cluster page. `inLanguage: 'id-ID'`
// since every article is written in Indonesian, matching the actual
// content (not the site-wide default, which has no declared language yet).
export function buildArticleSchema(params: { title: string; description: string; slug: string }) {
  const url = `${FABRIC_SITE_ORIGIN}/${params.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url,
    datePublished: CONTENT_PUBLISHED_DATE,
    dateModified: CONTENT_PUBLISHED_DATE,
    inLanguage: 'id-ID',
    author: { '@type': 'Organization', name: FABRIC_BRAND_NAME },
    publisher: { '@type': 'Organization', name: FABRIC_BRAND_NAME },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }
}

// Generic breadcrumb builder — unlike materials/seo.ts's two fabric-specific
// breadcrumb functions, content-cluster pages don't share one fixed depth,
// so this takes an explicit item list. Synced 1:1 with each page's own
// visible <nav aria-label="Breadcrumb">, same convention as Fabric Explorer.
export function buildArticleBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${FABRIC_SITE_ORIGIN}${item.path}`,
    })),
  }
}

// Parameterized FAQ schema — unlike src/lib/marketing/seo.ts's
// buildFaqSchema() (hardwired to the homepage's own faqCopy), this takes
// items directly so every article can supply its own, same pattern as
// materials/seo.ts's buildFabricFaqSchema().
export function buildArticleFaqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

// HowTo schema — only /cara-mengukur-thobe uses this; the other 3 articles
// aren't instructional-sequence content.
export function buildHowToSchema(params: { name: string; description: string; steps: { name: string; text: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    step: params.steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
    })),
  }
}

// Organization schema — broader entity identity than the existing
// LocalBusiness schema (src/lib/marketing/seo.ts's buildLocalBusinessSchema,
// reused as-is on content pages, not duplicated here). No `logo`/`sameAs` —
// no deployed logo image asset or social profile URLs exist to point to;
// omitted rather than fabricated.
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: FABRIC_BRAND_NAME,
    url: FABRIC_SITE_ORIGIN,
    description: 'Bespoke thobe tailoring — pattern formulation, measurement, and handcrafted production in Bogor.',
  }
}
