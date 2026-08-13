import type { KnowledgeArticle, KnowledgeRef } from './types'
import { getKnowledgeArticle } from './articles'
import { getCategoryBySlug } from './categories'

// Resolves KnowledgeRef[] -> real KnowledgeArticle[], silently dropping any
// ref that doesn't resolve (defensive against a future content edit that
// renames/removes a slug without updating every cross-link pointing at it).
export function resolveKnowledgeRefs(refs: KnowledgeRef[] | undefined): KnowledgeArticle[] {
  if (!refs || refs.length === 0) return []
  return refs
    .map((ref) => getKnowledgeArticle(ref.category, ref.slug))
    .filter((article): article is KnowledgeArticle => article !== undefined)
}

export function getRelatedArticles(article: KnowledgeArticle): KnowledgeArticle[] {
  return resolveKnowledgeRefs(article.relatedArticles)
}

export function getRelatedFabrics(article: KnowledgeArticle): KnowledgeArticle[] {
  return resolveKnowledgeRefs(article.relatedFabrics)
}

export function getRelatedCategories(slugs: string[] | undefined) {
  if (!slugs || slugs.length === 0) return []
  return slugs.map((slug) => getCategoryBySlug(slug)).filter((category): category is NonNullable<typeof category> => category !== undefined)
}
