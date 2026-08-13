import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { PRIMARY_ENTITY } from './entities'

// Sprint W7-1 — Reusable JSON-LD schema builders. This module is additive:
// it does NOT replace the existing per-domain builders in
// src/lib/marketing/seo.ts, src/lib/materials/seo.ts, src/lib/content/seo.ts,
// or src/lib/knowledge/seo.ts — those are shipped, live, and tested against
// real data for their own routes (fabric materials, knowledge articles,
// homepage). Rewriting them would be exactly the kind of large, risky
// module rewrite this project's own rules warn against. This file is the
// generic layer new pages reach for going forward, and the shape every
// domain-specific builder already independently converged on.
//
// Every function returns a plain JSON-LD object (schema.org vocabulary) —
// render it with <JsonLd data={...} /> (src/components/seo/JsonLd.tsx).

export type JsonLdSchema = Record<string, unknown>

// ---------------------------------------------------------------------------
// Organization / LocalBusiness / WebSite
// ---------------------------------------------------------------------------

export interface OrganizationSchemaParams {
  name?: string
  url?: string
  description?: string
  /** Social profile / external identity URLs. Omit entirely if none exist — never fabricate. */
  sameAs?: string[]
  /** Absolute URL to a real deployed logo asset. Omit if none exists. */
  logo?: string
}

export function organizationSchema(params: OrganizationSchemaParams = {}): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: params.name ?? PRIMARY_ENTITY.name,
    url: params.url ?? PRIMARY_ENTITY.url,
    description: params.description ?? PRIMARY_ENTITY.description,
    ...(params.logo ? { logo: params.logo } : {}),
    ...(params.sameAs && params.sameAs.length > 0 ? { sameAs: params.sameAs } : {}),
  }
}

export interface LocalBusinessSchemaParams {
  name?: string
  url?: string
  description?: string
  addressLocality?: string
  addressCountry?: string
  telephone?: string
}

export function localBusinessSchema(params: LocalBusinessSchemaParams = {}): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: params.name ?? PRIMARY_ENTITY.name,
    url: params.url ?? PRIMARY_ENTITY.url,
    description: params.description ?? PRIMARY_ENTITY.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: params.addressLocality ?? PRIMARY_ENTITY.addressLocality,
      addressCountry: params.addressCountry ?? PRIMARY_ENTITY.addressCountry,
    },
    ...(params.telephone ? { telephone: params.telephone } : {}),
  }
}

export interface WebSiteSchemaParams {
  name?: string
  url?: string
  /**
   * Set only when a real, working site-wide search endpoint exists — a
   * SearchAction pointing at a non-existent search feature is a broken rich
   * result, not a helpful one. No such search route exists in this repo as
   * of Sprint W7, so callers should omit this rather than invent a target.
   */
  searchUrlTemplate?: string
}

export function websiteSchema(params: WebSiteSchemaParams = {}): JsonLdSchema {
  const searchAction = params.searchUrlTemplate
    ? {
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: params.searchUrlTemplate,
          },
          'query-input': 'required name=search_term_string',
        },
      }
    : {}

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: params.name ?? PRIMARY_ENTITY.name,
    url: params.url ?? PRIMARY_ENTITY.url,
    ...searchAction,
  }
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string
  /** Absolute URL, or a path starting with "/" (resolved against FABRIC_SITE_ORIGIN). */
  path: string
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdSchema {
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

// ---------------------------------------------------------------------------
// Product / Service
// ---------------------------------------------------------------------------

export interface ProductSchemaParams {
  name: string
  description: string
  url: string
  image?: string[]
  brand?: string
  category?: string
  material?: string
  /** Free-text availability, e.g. 'https://schema.org/PreOrder'. Made-to-order goods rarely have a fixed price — omit `price` rather than fabricate one. */
  availability?: string
  additionalProperty?: { name: string; value: string }[]
  aggregateRating?: { ratingValue: number; reviewCount: number }
}

export function productSchema(params: ProductSchemaParams): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description,
    url: params.url,
    ...(params.image && params.image.length > 0 ? { image: params.image } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.material ? { material: params.material } : {}),
    ...(params.additionalProperty && params.additionalProperty.length > 0
      ? { additionalProperty: params.additionalProperty.map((p) => ({ '@type': 'PropertyValue', name: p.name, value: p.value })) }
      : {}),
    brand: { '@type': 'Brand', name: params.brand ?? PRIMARY_ENTITY.name },
    offers: {
      '@type': 'Offer',
      url: params.url,
      availability: params.availability ?? 'https://schema.org/PreOrder',
      businessFunction: 'https://schema.org/ProvideService',
    },
    ...(params.aggregateRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: params.aggregateRating.ratingValue,
            reviewCount: params.aggregateRating.reviewCount,
          },
        }
      : {}),
  }
}

export interface ServiceSchemaParams {
  name: string
  description: string
  url: string
  areaServed?: string
  serviceType?: string
}

export function serviceSchema(params: ServiceSchemaParams): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    description: params.description,
    url: params.url,
    ...(params.serviceType ? { serviceType: params.serviceType } : {}),
    areaServed: params.areaServed ?? PRIMARY_ENTITY.addressLocality,
    provider: {
      '@type': 'LocalBusiness',
      name: PRIMARY_ENTITY.name,
      url: PRIMARY_ENTITY.url,
    },
  }
}

// ---------------------------------------------------------------------------
// FAQ / HowTo
// ---------------------------------------------------------------------------

export interface FaqSchemaItem {
  question: string
  answer: string
}

export function faqSchema(items: FaqSchemaItem[]): JsonLdSchema | null {
  if (items.length === 0) return null
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

export interface HowToSchemaParams {
  name: string
  description: string
  steps: { name: string; text: string; image?: string }[]
  totalTime?: string
  estimatedCost?: { currency: string; value: string }
  tools?: string[]
  image?: string
}

export function howToSchema(params: HowToSchemaParams): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    ...(params.image ? { image: params.image } : {}),
    ...(params.totalTime ? { totalTime: params.totalTime } : {}),
    ...(params.estimatedCost
      ? { estimatedCost: { '@type': 'MonetaryAmount', currency: params.estimatedCost.currency, value: params.estimatedCost.value } }
      : {}),
    ...(params.tools && params.tools.length > 0 ? { tool: params.tools.map((tool) => ({ '@type': 'HowToTool', name: tool })) } : {}),
    step: params.steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      ...(step.image ? { image: step.image } : {}),
    })),
  }
}

// ---------------------------------------------------------------------------
// Person / Article
// ---------------------------------------------------------------------------

export interface PersonSchemaParams {
  name: string
  url: string
  jobTitle?: string
  description?: string
  image?: string
  worksFor?: string
  knowsAbout?: string[]
  sameAs?: string[]
}

export function personSchema(params: PersonSchemaParams): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: params.name,
    url: params.url,
    ...(params.jobTitle ? { jobTitle: params.jobTitle } : {}),
    ...(params.description ? { description: params.description } : {}),
    ...(params.image ? { image: params.image } : {}),
    ...(params.knowsAbout && params.knowsAbout.length > 0 ? { knowsAbout: params.knowsAbout } : {}),
    ...(params.sameAs && params.sameAs.length > 0 ? { sameAs: params.sameAs } : {}),
    worksFor: {
      '@type': 'Organization',
      name: params.worksFor ?? PRIMARY_ENTITY.name,
      url: PRIMARY_ENTITY.url,
    },
  }
}

export interface ArticleSchemaParams {
  headline: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  authorName?: string
  authorUrl?: string
  inLanguage?: string
  image?: string
}

export function articleSchema(params: ArticleSchemaParams): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    inLanguage: params.inLanguage ?? 'id-ID',
    ...(params.image ? { image: params.image } : {}),
    author: params.authorName
      ? { '@type': 'Person', name: params.authorName, ...(params.authorUrl ? { url: params.authorUrl } : {}) }
      : { '@type': 'Organization', name: PRIMARY_ENTITY.name },
    publisher: { '@type': 'Organization', name: PRIMARY_ENTITY.name },
    mainEntityOfPage: { '@type': 'WebPage', '@id': params.url },
  }
}
