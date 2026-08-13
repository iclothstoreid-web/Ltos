import type { KnowledgeCategory, KnowledgeArticle } from './types'

export interface KnowledgeBreadcrumbItem {
  name: string
  path: string
}

// One builder for all 3 page depths (landing / hub / article) — shared by
// both the visible <Breadcrumbs> component and the BreadcrumbList JSON-LD,
// so the two can never drift apart (same convention as src/lib/content/seo.ts
// buildArticleBreadcrumbSchema, which content pages sync 1:1 already).
export function buildKnowledgeBreadcrumb(params: { category?: KnowledgeCategory; article?: KnowledgeArticle }): KnowledgeBreadcrumbItem[] {
  const items: KnowledgeBreadcrumbItem[] = [
    { name: 'Home', path: '/' },
    { name: 'Knowledge', path: '/knowledge' },
  ]

  if (params.category) {
    items.push({ name: params.category.label, path: `/knowledge/${params.category.slug}` })
  }

  if (params.article) {
    items.push({ name: params.article.title, path: `/knowledge/${params.article.category}/${params.article.slug}` })
  }

  return items
}
