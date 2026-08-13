import Link from 'next/link'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import type { LocationConfig } from '@/lib/seo/locations'

interface NearbyAreasProps {
  otherLocations: LocationConfig[]
}

// Sprint W8-1 — "Nearby areas" from the brief, implemented as cross-links
// between the 5 city landing pages themselves ("other cities we serve") —
// not fabricated hyper-local sub-district content, which this codebase has
// no real data to back for 4 cities with no physical presence.
export function NearbyAreas({ otherLocations }: NearbyAreasProps) {
  if (otherLocations.length === 0) return null

  return (
    <section aria-labelledby="nearby-areas-heading" className="bg-luxury-navy px-6 py-16 md:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <GoldAccentLine className="mx-auto mb-4" />
          <h2 id="nearby-areas-heading" className="font-fraunces text-xl text-luxury-ivory md:text-2xl">
            Kota Lain yang Kami Layani
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {otherLocations.map((location) => (
              <li key={location.slug}>
                <Link
                  href={`/locations/${location.slug}`}
                  className="rounded-full border border-luxury-gold/[0.18] px-5 py-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe transition hover:border-luxury-gold/60 hover:text-luxury-gold"
                >
                  Custom Thobe {location.cityName}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
