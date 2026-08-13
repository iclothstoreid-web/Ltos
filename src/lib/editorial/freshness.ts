import { CONTENT_PUBLISHED_DATE } from '@/lib/content/seo'
import type { KnowledgeArticle } from '@/lib/knowledge/types'

// Sprint W6-10 — Content Refresh Engine. Pure functions over
// KnowledgeArticle's new optional publishedDate/lastReviewed/
// reviewIntervalDays fields, with a fallback to the existing
// CONTENT_PUBLISHED_DATE constant for the 58 W6-1..8 articles that don't
// set them explicitly — so freshness tracking works project-wide without
// having hand-edited every prior article's data.

export type UpdatePriority = 'low' | 'medium' | 'high'

export interface FreshnessInfo {
  publishedDate: string
  lastReviewed: string
  reviewIntervalDays: number
  daysSinceReview: number
  freshnessScore: number
  updatePriority: UpdatePriority
}

const DEFAULT_REVIEW_INTERVAL_DAYS = 180

export function getFreshnessInfo(article: KnowledgeArticle, now: Date = new Date()): FreshnessInfo {
  const publishedDate = article.publishedDate ?? CONTENT_PUBLISHED_DATE
  const lastReviewed = article.lastReviewed ?? publishedDate
  const reviewIntervalDays = article.reviewIntervalDays ?? DEFAULT_REVIEW_INTERVAL_DAYS

  const daysSinceReview = Math.max(0, Math.floor((now.getTime() - new Date(lastReviewed).getTime()) / (1000 * 60 * 60 * 24)))
  const freshnessScore = Math.max(0, Math.min(100, Math.round(100 - (daysSinceReview / reviewIntervalDays) * 100)))

  let updatePriority: UpdatePriority = 'low'
  if (daysSinceReview >= reviewIntervalDays) updatePriority = 'high'
  else if (daysSinceReview >= reviewIntervalDays * 0.75) updatePriority = 'medium'

  return { publishedDate, lastReviewed, reviewIntervalDays, daysSinceReview, freshnessScore, updatePriority }
}

export function getArticlesNeedingRefresh(articles: KnowledgeArticle[], now: Date = new Date()): KnowledgeArticle[] {
  return articles.filter((article) => getFreshnessInfo(article, now).updatePriority === 'high')
}
