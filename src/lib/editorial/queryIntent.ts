import type { KnowledgeCategorySlug } from '@/lib/knowledge/types'

// Sprint W6-9 — Editorial & Query Intelligence Engine. Maps every content
// cluster (and, where the content itself signals a different stage,
// individual articles) to a funnel position and search intent. Read-only
// classification layer — nothing here changes rendering or routing, it's
// the reference future editorial decisions (which gap to fill next, which
// CTA to lead with) are made against.

export type FunnelStage = 'TOFU' | 'MOFU' | 'BOFU'
export type QueryIntent = 'informational' | 'comparison' | 'commercial' | 'transactional' | 'local'

export interface QueryIntentProfile {
  funnelStage: FunnelStage
  intent: QueryIntent
}

// Category-level default — most articles in a cluster share one baseline
// funnel position. 'questions' and 'bandung' (originally 'bogor') are the
// two clusters added in W6-10 (see src/lib/knowledge/categories.ts).
export const CATEGORY_INTENT_PROFILE: Record<KnowledgeCategorySlug, QueryIntentProfile> = {
  fabrics: { funnelStage: 'TOFU', intent: 'informational' },
  measurements: { funnelStage: 'TOFU', intent: 'informational' },
  styling: { funnelStage: 'MOFU', intent: 'comparison' },
  wedding: { funnelStage: 'MOFU', intent: 'commercial' },
  umrah: { funnelStage: 'MOFU', intent: 'commercial' },
  tailoring: { funnelStage: 'TOFU', intent: 'informational' },
  care: { funnelStage: 'TOFU', intent: 'informational' },
  questions: { funnelStage: 'TOFU', intent: 'informational' },
  bandung: { funnelStage: 'BOFU', intent: 'local' },
  // Sprint Y — Digital Bespoke Tailoring cluster. High purchase-intent:
  // every article here directly answers "can I order without visiting
  // Bandung" and funnels to /design-studio, the same commercial-conversion
  // role wedding/umrah play for their own occasions.
  'design-studio': { funnelStage: 'BOFU', intent: 'commercial' },
}

// Article-level overrides — content whose own structure (a comparison
// table, a premium/custom tier, a "how many/how long" transactional
// question) signals a different stage than its category's baseline. Keyed
// as `${category}/${slug}` against the real KnowledgeArticle registry.
const ARTICLE_INTENT_OVERRIDES: Partial<Record<string, QueryIntentProfile>> = {
  'wedding/premium-thobe-wedding': { funnelStage: 'BOFU', intent: 'transactional' },
  'wedding/bespoke-wedding-guide': { funnelStage: 'BOFU', intent: 'commercial' },
  'wedding/timeline-custom-wedding': { funnelStage: 'BOFU', intent: 'transactional' },
  'umrah/premium-umrah-outfit': { funnelStage: 'BOFU', intent: 'transactional' },
  'umrah/custom-umrah-thobe': { funnelStage: 'BOFU', intent: 'transactional' },
  'tailoring/bespoke-vs-made-to-measure': { funnelStage: 'MOFU', intent: 'comparison' },
  'tailoring/what-is-bespoke': { funnelStage: 'TOFU', intent: 'informational' },
  'care/dry-clean-vs-hand-wash': { funnelStage: 'MOFU', intent: 'comparison' },
  'measurements/slim-vs-regular-fit': { funnelStage: 'MOFU', intent: 'comparison' },
  'measurements/thobe-size-guide': { funnelStage: 'MOFU', intent: 'commercial' },
  'fabrics/linen': { funnelStage: 'MOFU', intent: 'comparison' },
  'fabrics/premium-cotton': { funnelStage: 'MOFU', intent: 'comparison' },
}

export function getQueryIntentProfile(category: KnowledgeCategorySlug, slug: string): QueryIntentProfile {
  return ARTICLE_INTENT_OVERRIDES[`${category}/${slug}`] ?? CATEGORY_INTENT_PROFILE[category]
}

export function getArticlesByFunnelStage(
  articles: { category: KnowledgeCategorySlug; slug: string }[],
  stage: FunnelStage
): { category: KnowledgeCategorySlug; slug: string }[] {
  return articles.filter((article) => getQueryIntentProfile(article.category, article.slug).funnelStage === stage)
}
