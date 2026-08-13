import Link from 'next/link'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { getKnowledgeArticle } from '@/lib/knowledge/articles'
import type { CityConfig } from '@/lib/seo/cityConfig'

interface CityRelatedGuidesProps {
  city: CityConfig
}

// Sprint W8-2/3 — renamed from RelatedGuides.tsx (W8-1), extended with the
// brief's §6 fixed cross-links (Fabric Guide, Bespoke Process, Measurement
// Guide, Consultation/Appointment) alongside the per-city dynamic Knowledge
// article links. "#bespoke-process" is a same-page anchor — every city page
// renders BespokeProcessSection (id="bespoke-process") itself, so this
// always resolves without leaving the page.
const FIXED_LINKS = [
  { label: 'Fabric Guide', href: '/fabric' },
  { label: 'Bespoke Process', href: '#bespoke-process' },
  { label: 'Measurement Guide', href: '/cara-mengukur-thobe' },
  { label: 'Book a Consultation', href: '/book-appointment' },
] as const

export function CityRelatedGuides({ city }: CityRelatedGuidesProps) {
  const guides = city.relatedGuides
    .map(({ category, slug }) => getKnowledgeArticle(category, slug))
    .filter((article): article is NonNullable<typeof article> => article != null)

  return (
    <section aria-labelledby="related-guides-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Panduan</p>
          <h2 id="related-guides-heading" className="mt-3 font-fraunces text-2xl text-luxury-ivory md:text-3xl">
            Panduan Terkait untuk Klien di {city.city}
          </h2>
        </Reveal>

        {guides.length > 0 && (
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
        )}

        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {FIXED_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-luxury-gold/[0.14] px-5 py-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe transition hover:border-luxury-gold/60 hover:text-luxury-gold"
            >
              {link.label}
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
