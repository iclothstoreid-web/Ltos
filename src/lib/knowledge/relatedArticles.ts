import type { KnowledgeArticle, KnowledgeRef, KnowledgeTags } from './types'
import { getKnowledgeArticle, ALL_KNOWLEDGE_ARTICLES } from './articles'
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

// Sprint W6-7 — Related Content Engine. Finds other articles that share at
// least one tag value in any dimension (occasion/fit/audience/season/
// service), scored by number of shared tags, cross-category by design —
// this is what powers "Recommended for this occasion" (e.g. a wedding
// article and a styling article both tagged occasion:['pernikahan']).
// Excludes the article itself and anything already in relatedArticles, so
// the two rails never repeat the same card.
export function getRelatedByTags(article: KnowledgeArticle, limit = 3): KnowledgeArticle[] {
  const tags = article.tags
  if (!tags) return []

  const alreadyLinked = new Set((article.relatedArticles ?? []).map((ref) => `${ref.category}/${ref.slug}`))
  alreadyLinked.add(`${article.category}/${article.slug}`)

  const scored = ALL_KNOWLEDGE_ARTICLES.filter((candidate) => !alreadyLinked.has(`${candidate.category}/${candidate.slug}`))
    .map((candidate) => ({ candidate, score: countSharedTags(tags, candidate.tags) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((entry) => entry.candidate)
}

function countSharedTags(a: KnowledgeTags, b: KnowledgeTags | undefined): number {
  if (!b) return 0
  const dimensions: (keyof KnowledgeTags)[] = ['occasion', 'fit', 'audience', 'season', 'service']
  let count = 0
  for (const dimension of dimensions) {
    const aValues = a[dimension]
    const bValues = b[dimension]
    if (!aValues || !bValues) continue
    if (aValues.some((value) => bValues.includes(value))) count += 1
  }
  return count
}
