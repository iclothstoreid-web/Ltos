import Link from 'next/link'
import type { KnowledgeArticle } from '@/lib/knowledge/types'
import { getCategoryBySlug } from '@/lib/knowledge/categories'

interface RelatedArticlesProps {
  articles: KnowledgeArticle[]
  heading?: string
  headingId: string
}

// Renders already-resolved KnowledgeArticle[] (the page resolves refs via
// getRelatedArticles() before passing them in) — cross-category aware, each
// card shows its own category label so a measurement article can safely
// link to a fabric article without looking miscategorized.
export function RelatedArticles({ articles, heading = 'Panduan Terkait', headingId }: RelatedArticlesProps) {
  if (articles.length === 0) return null
  return (
    <nav aria-labelledby={headingId} className="mx-auto mt-14 max-w-3xl">
      <p id={headingId} className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
        {heading}
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {articles.map((article) => {
          const category = getCategoryBySlug(article.category)
          return (
            <li key={`${article.category}-${article.slug}`}>
              <Link
                href={`/knowledge/${article.category}/${article.slug}`}
                className="block rounded-2xl border border-luxury-gold/[0.14] bg-luxury-charcoal/20 px-5 py-4 transition hover:border-luxury-gold/40"
              >
                {category && <p className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-gold">{category.label}</p>}
                <p className="mt-1 font-luxury-sans text-sm text-luxury-ivory">{article.navLabel} →</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
