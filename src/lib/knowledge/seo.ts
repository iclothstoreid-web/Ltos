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
    'Pusat panduan Local Tailor — bahan thobe, cara mengukur badan, dan panduan styling. Referensi lengkap sebelum memesan thobe bespoke Anda.'
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
