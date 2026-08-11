import Link from 'next/link'
import { FABRIC_CATEGORY_LABELS, type FabricCategory, type FabricMaterial } from '@/types/material'
import { CategoryChip } from './CategoryChip'

interface InternalLinksSectionProps {
  category: FabricCategory
  siblingCategories: FabricCategory[]
  sameTexture: FabricMaterial[]
  sameColorFamily: FabricMaterial[]
}

function MaterialLinkList({ heading, materials }: { heading: string; materials: FabricMaterial[] }) {
  if (materials.length === 0) return null
  return (
    <nav aria-label={heading}>
      <h3 className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold">{heading}</h3>
      <ul className="mt-2 space-y-1">
        {materials.map((m) => (
          <li key={m.id}>
            <Link
              href={`/fabric/${m.category}/${m.slug}`}
              className="font-luxury-sans text-sm text-luxury-ivory underline decoration-luxury-gold/30 underline-offset-2 transition hover:text-luxury-gold"
            >
              {m.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// §6/§7 — the Internal Linking Engine's on-page rendering. `<aside>` since
// this is supplementary navigation, not the article's primary content
// (that's MaterialAuthoritySection/FaqSection/specs, wrapped in the
// page's own <article>). "Relevant article" from the brief's list is the
// category page itself here — there's no separate article/blog system
// yet, and linking to real, informative content (the category's own
// editorial page) is more honest than a placeholder href to nothing.
export function InternalLinksSection({ category, siblingCategories, sameTexture, sameColorFamily }: InternalLinksSectionProps) {
  const categoryLabel = FABRIC_CATEGORY_LABELS[category]

  return (
    <aside aria-labelledby="internal-links-heading" className="rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/10 p-5">
      <h2 id="internal-links-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        Explore Further
      </h2>

      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <MaterialLinkList heading="Related Textures" materials={sameTexture} />
        <MaterialLinkList heading="Same Color Family" materials={sameColorFamily} />

        <nav aria-label="Fabric category navigation">
          <h3 className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold">Explore More Fabrics</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <Link
                href={`/fabric/${category}`}
                className="font-luxury-sans text-sm text-luxury-ivory underline decoration-luxury-gold/30 underline-offset-2 transition hover:text-luxury-gold"
              >
                All {categoryLabel} Fabrics
              </Link>
            </li>
            <li>
              <Link
                href="/fabric"
                className="font-luxury-sans text-sm text-luxury-ivory underline decoration-luxury-gold/30 underline-offset-2 transition hover:text-luxury-gold"
              >
                Browse the Full Fabric Explorer
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Related fabric categories">
          <h3 className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold">Related Categories</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {siblingCategories.map((c) => (
              <CategoryChip key={c} category={c} />
            ))}
          </div>
        </nav>
      </div>
    </aside>
  )
}
