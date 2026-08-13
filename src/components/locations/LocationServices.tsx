import Link from 'next/link'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import type { CityConfig } from '@/lib/seo/cityConfig'

interface LocationServicesProps {
  city: CityConfig
}

// Sprint W8-1, migrated to cityConfig.ts in W8-2/3 — now renders
// city.services (unique per-city framing authored in cityConfig.ts, e.g.
// Jakarta's business-attire angle vs Bekasi's family/wedding angle) instead
// of one hardcoded array shared by every city, per this sprint's "no
// copy-paste between cities" instruction. Links stay fixed to real,
// already-live routes — /design-studio and the Knowledge base's
// wedding/umrah hubs — since the underlying services offered don't change
// by city, only how they're described.
const SERVICE_LINKS = ['/design-studio', '/design-studio', '/knowledge/wedding', '/knowledge/umrah']

export function LocationServices({ city }: LocationServicesProps) {
  return (
    <section aria-labelledby="location-services-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Layanan</p>
          <h2 id="location-services-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Layanan Bespoke Tailoring untuk Klien di {city.city}
          </h2>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {city.services.map((service, i) => (
            <Reveal as="li" key={service.title} delay={i * 0.08}>
              <Link
                href={SERVICE_LINKS[i] ?? '/design-studio'}
                className="block h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6 transition hover:border-luxury-gold/40"
              >
                <h3 className="font-fraunces text-lg text-luxury-ivory">{service.title}</h3>
                <p className="mt-2 font-luxury-sans text-xs leading-relaxed text-luxury-taupe">{service.description}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
