import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { buildLocationsHubLocalBusinessSchema } from '@/lib/seo/localBusiness'
import { buildLocationsHubMetadata } from '@/lib/seo/locationMetadata'
import { CITY_CONFIGS, CITY_BUSINESS } from '@/lib/seo/cityConfig'

export const metadata: Metadata = buildLocationsHubMetadata()

const BREADCRUMB_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Locations', path: '/locations' },
]

// Sprint W8-1 §6, migrated to cityConfig.ts in W8-2/3 — internal linking
// hub connecting all city pages. Real data only: CITY_CONFIGS is the same
// registry every city page reads from, so this hub can never link to a
// city that doesn't actually have a page (and vice versa — a new city
// added to cityConfig.ts appears here with zero changes to this file).
export default function LocationsHubPage() {
  return (
    <div className="bg-luxury-navy-deep">
      <JsonLd data={[buildLocationsHubLocalBusinessSchema(CITY_CONFIGS), breadcrumbSchema(BREADCRUMB_ITEMS)]} />
      <Nav />
      <main>
        <section className="relative overflow-hidden px-6 py-24 text-center md:px-10 md:py-32">
          <LuxuryGradientField variant="a" />
          <div className="relative mx-auto max-w-2xl">
            <Reveal>
              <GoldAccentLine className="mx-auto mb-4" />
              <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Lokasi Layanan</p>
              <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl">
                Custom Thobe di Seluruh Indonesia
              </h1>
              <p className="mx-auto mt-6 max-w-xl font-luxury-sans text-base text-luxury-taupe md:text-lg">
                {CITY_BUSINESS.name} berbasis di {CITY_BUSINESS.addressLocality} — melayani konsultasi dan
                pengiriman custom thobe ke kota-kota berikut.
              </p>
            </Reveal>
            <Breadcrumbs items={BREADCRUMB_ITEMS} />
          </div>
        </section>

        <section aria-labelledby="locations-grid-heading" className="px-6 pb-24 md:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 id="locations-grid-heading" className="sr-only">
              Kota yang Kami Layani
            </h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CITY_CONFIGS.map((city, i) => (
                <Reveal as="li" key={city.slug} delay={i * 0.08}>
                  <Link
                    href={`/locations/${city.slug}`}
                    className="block h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-8 transition hover:border-luxury-gold/40"
                  >
                    <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
                      {city.isPrimary ? 'Workshop & Showroom' : 'Layanan Konsultasi Remote'}
                    </p>
                    <h3 className="mt-3 font-fraunces text-2xl text-luxury-ivory">Custom Thobe {city.city}</h3>
                    <p className="mt-2 font-luxury-sans text-xs text-luxury-taupe">{city.province}</p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
