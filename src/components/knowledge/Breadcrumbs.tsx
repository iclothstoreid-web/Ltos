import Link from 'next/link'
import type { KnowledgeBreadcrumbItem } from '@/lib/knowledge/breadcrumbs'

interface BreadcrumbsProps {
  items: KnowledgeBreadcrumbItem[]
}

// Generic N-level breadcrumb (Home > Knowledge > Category > Article) — kept
// in sync 1:1 with buildKnowledgeBreadcrumbSchema, same convention as the
// existing W0.5 content cluster's ArticleBreadcrumbNav.
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto mb-8 max-w-3xl">
      <ol className="flex flex-wrap items-center gap-2 font-luxury-sans text-xs text-luxury-taupe">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.path} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {isLast ? (
                <span aria-current="page" className="text-luxury-ivory">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="transition-colors hover:text-luxury-gold">
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
