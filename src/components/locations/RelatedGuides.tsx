import Link from 'next/link'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { getKnowledgeArticle } from '@/lib/knowledge/articles'
import type { LocationConfig } from '@/lib/seo/locations'

interface RelatedGuidesProps {
  location: LocationConfig
}

// Sprint W8-1 — "Related guides" from the brief. Resolves each
// { category, slug } pair in locations.ts's relatedGuides against the real
// Knowledge base (getKnowledgeArticle) rather than hand-typing titles, so
// a title can never drift from the actual article, and a typo'd slug
// simply drops the card instead of rendering a broken link.
export function RelatedGuides({ location }: RelatedGuidesProps) {
  const guides = location.relatedGuides
    .map(({ category, slug }) => getKnowledgeArticle(category, slug))
    .filter((article): article is NonNullable<typeof article> => article != null)

  if (guides.length === 0) return null

  return (
    <section aria-labelledby="related-guides-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Panduan</p>
          <h2 id="related-guides-heading" className="mt-3 font-fraunces text-2xl text-luxury-ivory md:text-3xl">
            Panduan Terkait untuk Klien di {location.cityName}
          </h2>
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {guides.map((guide, i) => (
            <Reveal as="li" key={`${guide.category}-${guide.slug}`} delay={i * 0.08}>
              <Link
                href={`/knowledge/${guide.category}/${guide.slug}`}
                className="block h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-5 transition hover:border-luxury-gold/40"
              >
                <p className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-gold">{guide.eyebrow}</p>
                <h3 className="mt-2 font-fraunces text-base text-luxury-ivory">{guide.title}</h3>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
