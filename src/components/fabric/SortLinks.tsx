import Link from 'next/link'
import { FABRIC_SORT_LABELS, FABRIC_SORT_OPTIONS, type FabricSortOption } from '@/types/material'
import { buildSortHref, type FabricSearchParams } from '@/lib/materials/searchParamsHelpers'

interface SortLinksProps {
  basePath: string
  searchParams: FabricSearchParams
}

export function SortLinks({ basePath, searchParams }: SortLinksProps) {
  const activeSort: FabricSortOption = (() => {
    const raw = searchParams.sort
    const value = typeof raw === 'string' ? raw : undefined
    return (FABRIC_SORT_OPTIONS as readonly string[]).includes(value ?? '') ? (value as FabricSortOption) : 'featured'
  })()

  return (
    <nav aria-label="Sort fabrics" className="flex items-center gap-1 font-luxury-sans text-xs">
      <span className="text-luxury-taupe">Sort:</span>
      <ul className="flex flex-wrap items-center gap-1">
        {FABRIC_SORT_OPTIONS.map((option, i) => (
          <li key={option} className="flex items-center gap-1">
            <Link
              href={buildSortHref(basePath, searchParams, option)}
              aria-current={activeSort === option ? 'true' : undefined}
              className={`rounded px-1.5 py-0.5 transition focus-visible:ring-2 focus-visible:ring-luxury-gold/50 ${
                activeSort === option ? 'text-luxury-gold underline' : 'text-luxury-ivory hover:text-luxury-gold'
              }`}
            >
              {FABRIC_SORT_LABELS[option]}
            </Link>
            {i < FABRIC_SORT_OPTIONS.length - 1 && <span className="text-luxury-taupe/40">·</span>}
          </li>
        ))}
      </ul>
    </nav>
  )
}
