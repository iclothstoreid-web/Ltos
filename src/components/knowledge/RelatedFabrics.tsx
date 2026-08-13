import Link from 'next/link'
import type { KnowledgeArticle } from '@/lib/knowledge/types'

interface RelatedFabricsProps {
  fabrics: KnowledgeArticle[]
  headingId: string
}

// Styling -> Fabric internal-linking rule. Visually distinct from
// <RelatedArticles> (a filled card, not an outline) so "recommended fabric
// for this look" reads as a stronger recommendation than a generic "see
// also" link, even though both ultimately point at /knowledge/fabrics/*.
export function RelatedFabrics({ fabrics, headingId }: RelatedFabricsProps) {
  if (fabrics.length === 0) return null
  return (
    <section aria-labelledby={headingId} className="mx-auto mt-14 max-w-3xl">
      <h2 id={headingId} className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
        Rekomendasi Bahan
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {fabrics.map((fabric) => (
          <li key={fabric.slug}>
            <Link
              href={`/knowledge/fabrics/${fabric.slug}`}
              className="block rounded-2xl bg-luxury-gold/[0.08] px-5 py-4 ring-1 ring-inset ring-luxury-gold/20 transition hover:bg-luxury-gold/[0.14]"
            >
              <p className="font-fraunces text-lg text-luxury-ivory">{fabric.navLabel}</p>
              <p className="mt-1 font-luxury-sans text-xs leading-relaxed text-luxury-taupe">{fabric.dek}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
