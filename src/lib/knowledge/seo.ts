import type { Metadata } from 'next'
import { FABRIC_BRAND_NAME, FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { CONTENT_PUBLISHED_DATE } from '@/lib/content/seo'
import type { KnowledgeArticle, KnowledgeCategory, KnowledgeFaqItem } from './types'
import type { KnowledgeBreadcrumbItem } from './breadcrumbs'

// Reuses the same origin/brand/publish-date constants as the existing W0.5
// content cluster (src/lib/content/seo.ts) and Fabric Explorer
// (src/lib/materials/seo.ts) rather than declaring new copies.

export function buildKnowledgeLandingMetadata(): Metadata {
  const url = `${FABRIC_SITE_ORIGIN}/knowledge`
  const title = `Knowledge — Panduan Bahan, Pengukuran, dan Gaya Thobe | ${FABRIC_BRAND_NAME}`
  const description =
    'Pusat panduan Tarda — bahan thobe, cara mengukur badan, dan panduan styling. Referensi lengkap sebelum memesan thobe bespoke Anda.'
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, siteName: FABRIC_BRAND_NAME, type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

export function buildKnowledgeCategoryMetadata(category: KnowledgeCategory): Metadata {
  const url = `${FABRIC_SITE_ORIGIN}/knowledge/${category.slug}`
  const title = `${category.title} | ${FABRIC_BRAND_NAME}`
  return {
    title,
    description: category.metaDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description: category.metaDescription, url, siteName: FABRIC_BRAND_NAME, type: 'website' },
    twitter: { card: 'summary', title, description: category.metaDescription },
  }
}

export function buildKnowledgeArticleMetadata(article: KnowledgeArticle): Metadata {
  const url = `${FABRIC_SITE_ORIGIN}/knowledge/${article.category}/${article.slug}`
  const title = `${article.title} | ${FABRIC_BRAND_NAME}`
  return {
    title,
    description: article.metaDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description: article.metaDescription, url, siteName: FABRIC_BRAND_NAME, type: 'article' },
    twitter: { card: 'summary', title, description: article.metaDescription },
  }
}

export function buildKnowledgeArticleSchema(article: KnowledgeArticle) {
  const url = `${FABRIC_SITE_ORIGIN}/knowledge/${article.category}/${article.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    url,
    datePublished: CONTENT_PUBLISHED_DATE,
    dateModified: CONTENT_PUBLISHED_DATE,
    inLanguage: 'id-ID',
    author: { '@type': 'Organization', name: FABRIC_BRAND_NAME },
    publisher: { '@type': 'Organization', name: FABRIC_BRAND_NAME },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }
}

export function buildKnowledgeBreadcrumbSchema(items: KnowledgeBreadcrumbItem[]) {
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

export function buildKnowledgeFaqSchema(items: KnowledgeFaqItem[]) {
  if (items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

// Sprint W6-8 — HowTo schema for articles whose sections contain a `steps`
// block (mirrors src/lib/content/seo.ts's buildHowToSchema for the W0.5
// cluster's cara-mengukur-thobe). Scans `sections` + their `subsections`
// for the first steps block rather than requiring a separate field, so
// existing article data doesn't need restructuring to opt in.
export function buildKnowledgeHowToSchema(article: KnowledgeArticle) {
  const stepsBlock = article.sections
    .flatMap((section) => [section.block, ...(section.subsections ?? []).map((sub) => sub.block)])
    .find((block) => block.kind === 'steps')

  if (!stepsBlock || stepsBlock.kind !== 'steps') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.metaDescription,
    step: stepsBlock.items.map((step) => ({ '@type': 'HowToStep', name: step.name, text: step.text })),
  }
}

// ItemList — the ordered list of articles shown on a category hub, so the
// hub's "Panduan di Kategori Ini" grid has matching structured data.
export function buildKnowledgeItemListSchema(articles: KnowledgeArticle[], listName: string) {
  if (articles.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${FABRIC_SITE_ORIGIN}/knowledge/${article.category}/${article.slug}`,
      name: article.title,
    })),
  }
}

// CollectionPage — the /knowledge landing page and the 7 category hubs are
// collections of articles, not single articles themselves; CollectionPage
// is the correct schema.org type for that (Article schema is reserved for
// the 58 individual article pages).
export function buildKnowledgeCollectionPageSchema(params: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: params.name,
    description: params.description,
    url: params.url,
    isPartOf: { '@type': 'WebSite', name: FABRIC_BRAND_NAME, url: FABRIC_SITE_ORIGIN },
  }
}

// Generic WebPage schema — used where CollectionPage/Article don't apply
// but a page still benefits from an explicit WebPage entity (currently
// unused by any route in this sprint; kept available for W6-9+ pages that
// aren't article/collection shaped).
export function buildKnowledgeWebPageSchema(params: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: params.name,
    description: params.description,
    url: params.url,
  }
}

// Sprint W6-8 — Person schema builder, requested for E-E-A-T. Deliberately
// NOT wired into any article: schema.org Person requires representing a
// real, identifiable individual, and no named tailor has a real bio/photo
// in this codebase. Attaching a fabricated "expert author" name to satisfy
// a schema checklist item would be a fake-authority signal — the kind of
// thing Google's own E-E-A-T guidance flags as manipulative, not something
// it rewards. ExpertNote content is instead attributed to the brand
// (Organization), which is the honest entity that actually stands behind
// it. This builder exists so a future sprint can wire it up once real,
// consenting named tailors are documented — see README note in
// PLAN docs if one exists, otherwise treat this comment as that record.
export function buildKnowledgePersonSchema(params: { name: string; jobTitle: string; worksFor?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: params.name,
    jobTitle: params.jobTitle,
    worksFor: { '@type': 'Organization', name: params.worksFor ?? FABRIC_BRAND_NAME },
  }
}

// Sprint W6-8 — ImageObject schema builder. Also NOT wired into any
// article for the same honesty reason as Person: zero Knowledge articles
// have real photography (same situation the W0.5 cluster documented for
// its own guide pages — "no real photography exists for these guide pages
// yet"). Emitting ImageObject schema pointing at a placeholder or stock
// asset would misrepresent it as the article's real illustrative image.
// Ready for the day real per-article photography exists.
export function buildKnowledgeImageObjectSchema(params: { url: string; alt: string; width: number; height: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: params.url,
    description: params.alt,
    width: params.width,
    height: params.height,
  }
}
