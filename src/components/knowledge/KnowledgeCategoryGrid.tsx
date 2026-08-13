import Link from 'next/link'
import type { KnowledgeCategory } from '@/lib/knowledge/types'
import { getArticlesByCategory } from '@/lib/knowledge/articles'

interface KnowledgeCategoryGridProps {
  categories: KnowledgeCategory[]
  headingId?: string
}

// Used on the /knowledge landing page (all 7 categories) and as the
// "Related categories" block on hub pages (2–3 categories). Foundation
// categories (no articles yet) get a "Segera Hadir" badge instead of an
// article count, so the grid is honest about what's live this sprint.
export function KnowledgeCategoryGrid({ categories, headingId }: KnowledgeCategoryGridProps) {
  return (
    <ul aria-labelledby={headingId} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const articleCount = getArticlesByCategory(category.slug).length
        return (
          <li key={category.slug}>
            <Link
              href={`/knowledge/${category.slug}`}
              className="group block h-full rounded-2xl border border-luxury-gold/[0.14] bg-luxury-charcoal/20 p-6 transition hover:border-luxury-gold/40"
            >
              <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">{category.eyebrow}</p>
              <h3 className="mt-3 font-fraunces text-xl text-luxury-ivory">{category.label}</h3>
              <p className="mt-2 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{category.intro[0]}</p>
              <p className="mt-4 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold transition group-hover:text-luxury-ivory">
                {articleCount > 0 ? `${articleCount} Panduan →` : 'Segera Hadir →'}
              </p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
