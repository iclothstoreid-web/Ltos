import Link from 'next/link'
import { ARTICLE_NAV } from '@/lib/content/articles'

interface RelatedArticlesProps {
  slugs: string[]
}

export function RelatedArticles({ slugs }: RelatedArticlesProps) {
  const items = ARTICLE_NAV.filter((entry) => slugs.includes(entry.slug))
  if (items.length === 0) return null

  return (
    <nav aria-label="Panduan terkait" className="mx-auto mt-14 max-w-3xl">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Panduan Terkait</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/${item.slug}`}
              className="block rounded-2xl border border-luxury-gold/[0.14] bg-luxury-charcoal/20 px-5 py-4 font-luxury-sans text-sm text-luxury-ivory transition hover:border-luxury-gold/40"
            >
              {item.navLabel} →
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
