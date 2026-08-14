import Link from 'next/link'
import { SERVICE_CONFIGS } from '@/lib/seo/serviceConfig'

interface RelatedServicesLinksProps {
  heading?: string
}

// Sprint W10 — Internal Linking Engine (Task 4), the "Knowledge Engine →
// Landing Pages" and "Design Studio → Landing Pages" direction. Purely
// additive: a small link row, not a redesign of either host page. Kept
// deliberately separate from KnowledgeCTAGroup (shared across every
// Knowledge article/category page — higher blast radius to modify) so
// this only touches the two pages it's explicitly mounted on.
export function RelatedServicesLinks({ heading = 'Jelajahi Layanan Bespoke Kami' }: RelatedServicesLinksProps) {
  return (
    <section aria-labelledby="related-services-heading" className="mx-auto mt-14 max-w-4xl text-center">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Layanan</p>
      <h2 id="related-services-heading" className="mt-2 font-fraunces text-xl text-luxury-ivory md:text-2xl">
        {heading}
      </h2>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {SERVICE_CONFIGS.map((service) => (
          <Link
            key={service.slug}
            href={`/${service.slug}`}
            className="rounded-full border border-luxury-gold/[0.14] px-5 py-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe transition hover:border-luxury-gold/60 hover:text-luxury-gold"
          >
            {service.hero.eyebrow}
          </Link>
        ))}
      </div>
    </section>
  )
}
