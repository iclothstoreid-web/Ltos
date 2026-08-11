import Link from 'next/link'
import { FABRIC_CATEGORY_LABELS, type FabricMaterial } from '@/types/material'

interface ComparisonPreviewSectionProps {
  candidates: FabricMaterial[]
}

// Preview only (§10 — "Belum perlu comparison page penuh, cukup preview
// card") — each card links to its own detail page for now rather than to
// a dedicated /compare route that doesn't exist yet.
export function ComparisonPreviewSection({ candidates }: ComparisonPreviewSectionProps) {
  if (candidates.length === 0) return null

  return (
    <section aria-labelledby="compare-heading">
      <h2 id="compare-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        Compare With
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {candidates.map((candidate) => (
          <Link
            key={candidate.id}
            href={`/fabric/${candidate.category}/${candidate.slug}`}
            className="rounded-xl border border-luxury-gold/10 bg-luxury-charcoal/20 p-4 transition hover:border-luxury-gold/40 focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
          >
            <p className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-gold">
              {FABRIC_CATEGORY_LABELS[candidate.category]}
            </p>
            <p className="mt-1 font-luxury-sans text-sm text-luxury-ivory">{candidate.name}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
