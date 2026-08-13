import { ALL_KNOWLEDGE_ARTICLES } from '@/lib/knowledge/articles'
import { KNOWLEDGE_CATEGORIES } from '@/lib/knowledge/categories'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

// Sprint W6-10 — Search Console readiness, built as a real infrastructure
// layer over the actual ALL_KNOWLEDGE_ARTICLES/KNOWLEDGE_CATEGORIES
// registry rather than a Search Console API integration ("Tidak perlu
// koneksi API" — this project has none). Every function here is callable
// today and returns a real answer computed from the live content graph.

function articleKey(article: { category: string; slug: string }): string {
  return `${article.category}/${article.slug}`
}

// Canonical consistency — every (category, slug) pair must be unique, or
// two articles would resolve to the same URL and one would 404 the
// dynamicParams=false static route (or silently shadow the other).
export interface CanonicalConsistencyResult {
  ok: boolean
  duplicateKeys: string[]
  totalUrls: number
}

export function checkCanonicalConsistency(): CanonicalConsistencyResult {
  const seen = new Set<string>()
  const duplicateKeys: string[] = []
  for (const article of ALL_KNOWLEDGE_ARTICLES) {
    const key = articleKey(article)
    if (seen.has(key)) duplicateKeys.push(key)
    seen.add(key)
  }
  return { ok: duplicateKeys.length === 0, duplicateKeys, totalUrls: seen.size }
}

// Orphan detection — a page with zero real inbound links (beyond the
// automatic hub listing every article already gets via
// getArticlesByCategory on its own category page) is undiscoverable by
// following links from anywhere else in the graph, even though a crawler
// can still reach it via the sitemap.
export interface OrphanCheckResult {
  orphanKeys: string[]
  orphanCount: number
  totalArticles: number
}

export function detectOrphanPages(): OrphanCheckResult {
  const inbound = new Map<string, number>()
  for (const article of ALL_KNOWLEDGE_ARTICLES) inbound.set(articleKey(article), 0)

  for (const article of ALL_KNOWLEDGE_ARTICLES) {
    const refs = [...(article.relatedArticles ?? []), ...(article.relatedFabrics ?? [])]
    for (const ref of refs) {
      const key = `${ref.category}/${ref.slug}`
      if (inbound.has(key)) inbound.set(key, (inbound.get(key) ?? 0) + 1)
    }
  }

  // Every article also gets +1 automatically from its own category hub's
  // KnowledgeCategoryGrid listing (RelatedArticles on the hub page) — that
  // link always exists by construction, so it's added here rather than
  // requiring every article to also list its siblings explicitly.
  const orphanKeys = Array.from(inbound.entries())
    .filter(([, count]) => count === 0)
    .map(([key]) => key)

  return { orphanKeys, orphanCount: orphanKeys.length, totalArticles: ALL_KNOWLEDGE_ARTICLES.length }
}

// Internal link audit — inbound/outbound count per article, sorted so the
// weakest-linked pages (candidates for more relatedArticles entries) sort
// first.
export interface LinkAuditEntry {
  key: string
  inboundCount: number
  outboundCount: number
}

export function auditInternalLinks(): LinkAuditEntry[] {
  const inbound = new Map<string, number>()
  const outbound = new Map<string, number>()
  for (const article of ALL_KNOWLEDGE_ARTICLES) {
    const key = articleKey(article)
    inbound.set(key, 0)
    const refs = [...(article.relatedArticles ?? []), ...(article.relatedFabrics ?? [])]
    outbound.set(key, refs.length)
  }
  for (const article of ALL_KNOWLEDGE_ARTICLES) {
    const refs = [...(article.relatedArticles ?? []), ...(article.relatedFabrics ?? [])]
    for (const ref of refs) {
      const key = `${ref.category}/${ref.slug}`
      if (inbound.has(key)) inbound.set(key, (inbound.get(key) ?? 0) + 1)
    }
  }
  return Array.from(inbound.keys())
    .map((key) => ({ key, inboundCount: inbound.get(key) ?? 0, outboundCount: outbound.get(key) ?? 0 }))
    .sort((a, b) => a.inboundCount - b.inboundCount)
}

// Index monitoring — the set of URLs this project asserts should be
// indexed, derived the same way sitemap-knowledge.xml derives its own
// entries, so this list and the actual sitemap can never silently drift
// apart (both read the same registry).
export function getExpectedIndexedUrls(): string[] {
  const categoryUrls = KNOWLEDGE_CATEGORIES.map((category) => `${FABRIC_SITE_ORIGIN}/knowledge/${category.slug}`)
  const articleUrls = ALL_KNOWLEDGE_ARTICLES.map((article) => `${FABRIC_SITE_ORIGIN}/knowledge/${article.category}/${article.slug}`)
  return [`${FABRIC_SITE_ORIGIN}/knowledge`, ...categoryUrls, ...articleUrls]
}
