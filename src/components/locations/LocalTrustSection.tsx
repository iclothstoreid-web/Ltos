import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { trustBarCopy } from '@/lib/marketing/copy'
import { LOCATION_BUSINESS, type LocationConfig } from '@/lib/seo/locations'

interface LocalTrustSectionProps {
  location: LocationConfig
}

// Sprint W8-1 — "Local trust section" from the brief. Distinct from the
// homepage's generic TrustBar (reused as-is elsewhere in the template):
// this combines the same real, already-established trust metrics with an
// honest statement about how this specific city is served. No fabricated
// per-city claims (order counts, delivery-time guarantees) — only the
// real address for Bandung, and the real remote-consultation model for
// every other city, matching locations.ts's own SERVES_REMOTELY_FAQ.
export function LocalTrustSection({ location }: LocalTrustSectionProps) {
  return (
    <section aria-labelledby="local-trust-heading" className="border-y border-luxury-gold/[0.14] bg-luxury-navy px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <h2 id="local-trust-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
            {location.trustStatement}
          </h2>
          {location.isPrimary ? (
            <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
              {LOCATION_BUSINESS.name} — {LOCATION_BUSINESS.streetAddress}
            </p>
          ) : (
            <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
              Konsultasi via WhatsApp, pengukuran final di workshop kami di Bandung, garmen dikirim ke {location.cityName}.
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
