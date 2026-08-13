import type { KnowledgeArticle, KnowledgeCategorySlug } from '../types'
import { FABRIC_ARTICLES } from './fabrics'
import { MEASUREMENT_ARTICLES } from './measurements'
import { STYLING_ARTICLES } from './styling'
import { WEDDING_ARTICLES } from './wedding'
import { UMRAH_ARTICLES } from './umrah'
import { TAILORING_ARTICLES } from './tailoring'
import { CARE_ARTICLES } from './care'

export const ALL_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  ...FABRIC_ARTICLES,
  ...MEASUREMENT_ARTICLES,
  ...STYLING_ARTICLES,
  ...WEDDING_ARTICLES,
  ...UMRAH_ARTICLES,
  ...TAILORING_ARTICLES,
  ...CARE_ARTICLES,
]

export function getKnowledgeArticle(category: string, slug: string): KnowledgeArticle | undefined {
  return ALL_KNOWLEDGE_ARTICLES.find((article) => article.category === category && article.slug === slug)
}

export function getArticlesByCategory(category: KnowledgeCategorySlug): KnowledgeArticle[] {
  return ALL_KNOWLEDGE_ARTICLES.filter((article) => article.category === category)
}

export { FABRIC_ARTICLES, MEASUREMENT_ARTICLES, STYLING_ARTICLES, WEDDING_ARTICLES, UMRAH_ARTICLES, TAILORING_ARTICLES, CARE_ARTICLES }
