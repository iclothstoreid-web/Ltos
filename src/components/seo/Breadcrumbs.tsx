import Link from 'next/link'
import type { BreadcrumbItem } from '@/lib/seo/schema'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

// Sprint W7-6 — generic reusable breadcrumb nav, same visible markup as
// src/components/knowledge/Breadcrumbs.tsx (kept as-is for the Knowledge
// section, which already ships this) but typed against the shared
// BreadcrumbItem from lib/seo/schema.ts so any new page can use one
// component + one schema builder without importing Knowledge-specific types.
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
