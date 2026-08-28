import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { Link } from '@/i18n/routing'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'

interface ServiceNationalCoverageProps {
  service: ServiceConfig
}

// National SEO — the "how the one Bandung workshop serves all of Indonesia"
// section, rendered only for scope: 'national' pillars. Content is entirely
// from serviceConfig.ts's ServiceNationalCoverage (verified remote model —
// see /knowledge/design-studio/bespoke-tanpa-harus-datang-ke-bandung). No
// branch, coverage, shipping-guarantee, or turnaround claim is made here
// beyond what that config carries.
export function ServiceNationalCoverage({ service }: ServiceNationalCoverageProps) {
  const coverage = service.nationalCoverage
  if (!coverage) return null

  return (
    <section aria-labelledby="service-national-coverage-heading" className="border-y border-luxury-gold/[0.14] bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Layanan Nasional</p>
          <h2 id="service-national-coverage-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {coverage.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-luxury-sans text-sm text-luxury-taupe">{coverage.intro}</p>
        </Reveal>

        <ol className="mt-12 space-y-4">
          {coverage.points.map((point, i) => (
            <Reveal as="li" key={point.title} delay={i * 0.06} className="rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6">
              <h3 className="font-fraunces text-base text-luxury-ivory">{point.title}</h3>
              <p className="mt-2 font-luxury-sans text-sm text-luxury-taupe">{point.description}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1} className="mt-8 text-center">
          <p className="mx-auto max-w-xl font-luxury-sans text-xs text-luxury-taupe">
            {coverage.bandungAnchorNote}{' '}
            <Link href="/locations" className="text-luxury-gold underline-offset-4 hover:underline">
              Lihat cakupan layanan per kota
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  )
}
