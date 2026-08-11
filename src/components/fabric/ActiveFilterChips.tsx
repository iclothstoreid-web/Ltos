import Link from 'next/link'
import type { FabricCategory } from '@/types/material'
import { buildActiveFilterChips, buildClearAllHref, type FabricSearchParams } from '@/lib/materials/searchParamsHelpers'

interface ActiveFilterChipsProps {
  basePath: string
  searchParams: FabricSearchParams
  lockedCategory?: FabricCategory
}

export function ActiveFilterChips({ basePath, searchParams, lockedCategory }: ActiveFilterChipsProps) {
  const chips = buildActiveFilterChips(basePath, searchParams, { lockedCategory })
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.removeHref}
          className="group inline-flex items-center gap-1.5 rounded-full border border-luxury-gold/30 bg-luxury-gold/10 px-3 py-1 font-luxury-sans text-xs text-luxury-ivory transition hover:border-luxury-gold focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label}
          <span aria-hidden="true" className="text-luxury-taupe group-hover:text-luxury-gold">
            ×
          </span>
        </Link>
      ))}
      <Link
        href={buildClearAllHref(basePath)}
        className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe underline decoration-luxury-taupe/40 underline-offset-2 transition hover:text-luxury-gold focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
      >
        Clear all filters
      </Link>
    </div>
  )
}
