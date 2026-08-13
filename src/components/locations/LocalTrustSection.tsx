import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { trustBarCopy } from '@/lib/marketing/copy'
import { CITY_BUSINESS, CITY_MAPS_URL, type CityConfig } from '@/lib/seo/cityConfig'

interface LocalTrustSectionProps {
  city: CityConfig
}

// Sprint W8-1, migrated to cityConfig.ts in W8-2/3 — "Local trust section"
// + "Workshop Location" (Bandung only — the one real address). Combines
// the same real, already-established trust metrics with an honest
// statement about how this specific city is served, plus a real "Get
// Directions" link built from the real address (CITY_MAPS_URL, a Google
// Maps search query — not a fabricated/guessed pin) on the Bandung page.
// No fabricated per-city claims (order counts, delivery-time guarantees).
export function LocalTrustSection({ city }: LocalTrustSectionProps) {
  return (
    <section aria-labelledby="local-trust-heading" className="border-y border-luxury-gold/[0.14] bg-luxury-navy px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <h2 id="local-trust-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
            {city.trustStatement}
          </h2>
          {city.isPrimary ? (
            <>
              <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
                {CITY_BUSINESS.name} — {CITY_BUSINESS.streetAddress}
              </p>
              <div className="mt-6">
                <MagneticButton href={CITY_MAPS_URL} target="_blank" rel="noopener noreferrer" variant="ghost">
                  Get Directions
                </MagneticButton>
              </div>
            </>
          ) : (
            <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
              Konsultasi via WhatsApp, pengukuran final di workshop kami di Bandung, garmen dikirim ke {city.city}.
            </p>
          )}
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {trustBarCopy.counters.map((counter) => (
            <li key={counter.label} className="text-center">
              <p className="font-fraunces text-2xl text-luxury-gold md:text-3xl">
                {counter.value}
                {counter.suffix}
              </p>
              <p className="mt-2 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe">{counter.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
