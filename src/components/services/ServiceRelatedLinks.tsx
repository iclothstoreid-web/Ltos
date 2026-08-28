import Link from 'next/link'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { getKnowledgeArticle } from '@/lib/knowledge/articles'
import { SERVICE_CONFIGS, type ServiceConfig } from '@/lib/seo/serviceConfig'
import { NATIONAL_CONFIGS } from '@/lib/seo/nationalConfig'

interface ServiceRelatedLinksProps {
  service: ServiceConfig
}

// Sprint W10 — Internal Linking Engine (Task 4). Every landing page gets:
// - 3 dynamic Knowledge Engine article links (per-page, from
//   serviceConfig.ts's relatedGuides — real, verified slugs only)
// - Design Studio + Fabric Explorer + Bespoke Process (same-page anchor,
//   every page below renders <BespokeProcessSection id="bespoke-process">)
//   + Book Appointment — the same fixed cross-links CityRelatedGuides.tsx
//   already establishes for /locations pages
// - 2 sibling landing pages (the other 4 Revenue Landing Pages), so the 5
//   new pages form their own internal link cluster, not just leaves
//   hanging off Knowledge/Design Studio
// = 3 + 4 + 2 = 9 contextual links per page, comfortably over the brief's
// "minimal 5 internal links per landing page".
const FIXED_LINKS = [
  { label: 'Design Studio', href: '/design-studio' },
  { label: 'Fabric Explorer', href: '/fabric' },
  { label: 'Bespoke Process', href: '#bespoke-process' },
  { label: 'Book a Consultation', href: '/book-appointment' },
] as const

function pickSiblingServices(currentSlug: string): ServiceConfig[] {
  const others = SERVICE_CONFIGS.filter((s) => s.slug !== currentSlug)
  // Deterministic (not random) so the same page always renders the same
  // siblings — two after the current one in array order, wrapping around.
  const startIndex = SERVICE_CONFIGS.findIndex((s) => s.slug === currentSlug)
  return [others[startIndex % others.length], others[(startIndex + 1) % others.length]].filter(
    (s, i, arr): s is ServiceConfig => s != null && arr.indexOf(s) === i
  )
}

export function ServiceRelatedLinks({ service }: ServiceRelatedLinksProps) {
  const guides = service.relatedGuides
    .map(({ category, slug }) => getKnowledgeArticle(category, slug))
    .filter((article): article is NonNullable<typeof article> => article != null)
  const isNational = service.scope === 'national'

  // National SEO (Task 13) — each local Bandung page links UP to its
  // national parent (varied, not mechanical). custom-baju-koko / umroh have
  // no P0 national parent yet (P1 deferred), so they point at the closest
  // one, /custom-thobe-indonesia.
  const NATIONAL_PARENT: Record<string, string> = {
    'bespoke-tailor-bandung': '/bespoke-tailor-indonesia',
    'tailor-premium-bandung': '/bespoke-tailor-indonesia',
    'jahit-thobe-bandung': '/custom-thobe-indonesia',
    'custom-baju-koko-bandung': '/custom-thobe-indonesia',
    'tailor-baju-umroh-bandung': '/custom-thobe-indonesia',
  }

  // National pillar: link DOWN to the Bandung service pages + the other
  // national pillar + the locations hub (national -> local -> geo). Local
  // page: sideways sibling links + the Bandung location page + up to its
  // national parent.
  const relatedLabel = isNational ? 'Halaman Terkait' : 'Layanan Terkait'
  const parentHref = NATIONAL_PARENT[service.slug]
  const relatedServiceLinks: { key: string; href: string; label: string }[] = isNational
    ? [
        ...NATIONAL_CONFIGS.filter((n) => n.slug !== service.slug).map((n) => ({
          key: n.slug,
          href: `/${n.slug}`,
          label: n.hero.eyebrow,
        })),
        ...SERVICE_CONFIGS.map((s) => ({ key: s.slug, href: `/${s.slug}`, label: s.hero.eyebrow })),
        { key: 'locations', href: '/locations', label: 'Cakupan Layanan per Kota' },
      ]
    : [
        ...(parentHref
          ? [{ key: 'national-parent', href: parentHref, label: 'Layanan Nasional — Seluruh Indonesia' }]
          : []),
        ...pickSiblingServices(service.slug).map((s) => ({ key: s.slug, href: `/${s.slug}`, label: s.hero.eyebrow })),
        { key: 'locations-bandung', href: '/locations/bandung', label: 'Lokasi Workshop Bandung' },
      ]

  return (
    <section aria-labelledby="service-related-links-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Panduan</p>
          <h2 id="service-related-links-heading" className="mt-3 font-fraunces text-2xl text-luxury-ivory md:text-3xl">
            Panduan Terkait untuk {service.garmentLabel}
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

        {relatedServiceLinks.length > 0 && (
          <div className="mt-10 text-center">
            <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">{relatedLabel}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              {relatedServiceLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="rounded-full border border-luxury-gold/[0.14] px-5 py-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe transition hover:border-luxury-gold/60 hover:text-luxury-gold"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
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
