import Link from 'next/link'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import type { CityConfig } from '@/lib/seo/cityConfig'

interface CityNearbyAreasProps {
  city: CityConfig
  otherCities: CityConfig[]
}

// Sprint W8-2/3 — renamed + extended from NearbyAreas.tsx (W8-1). Now
// covers two distinct things in one section:
//   1. city.localContext — real neighborhood/area names (e.g. Dago,
//      Setiabudi for Bogor), rendered as plain text chips, never as
//      links (no dedicated page exists for a neighborhood) and never
//      framed as a branch — "kami melayani klien dari X", not "cabang X".
//   2. Sibling city pages — cross-links between the 5 /locations/[city]
//      routes, same as W8-1's NearbyAreas.
export function CityNearbyAreas({ city, otherCities }: CityNearbyAreasProps) {
  return (
    <section aria-labelledby="nearby-areas-heading" className="bg-luxury-navy px-6 py-16 md:px-10">
      <div className="mx-auto max-w-4xl text-center">
        {city.localContext.length > 0 && (
          <Reveal>
            <GoldAccentLine className="mx-auto mb-4" />
            <h2 id="nearby-areas-heading" className="font-fraunces text-xl text-luxury-ivory md:text-2xl">
              Melayani Klien dari Seluruh {city.city} dan Sekitarnya
            </h2>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {city.localContext.map((area) => (
                <li
                  key={area}
                  className="rounded-full border border-luxury-gold/[0.10] px-4 py-1.5 font-luxury-sans text-xs text-luxury-taupe"
                >
                  {area}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {otherCities.length > 0 && (
          <Reveal delay={0.05} className={city.localContext.length > 0 ? 'mt-14' : ''}>
            <h3 className="font-fraunces text-lg text-luxury-ivory">Kota Lain yang Kami Layani</h3>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {otherCities.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/locations/${other.slug}`}
                    className="rounded-full border border-luxury-gold/[0.18] px-5 py-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe transition hover:border-luxury-gold/60 hover:text-luxury-gold"
                  >
                    Custom Thobe {other.city}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  )
}
