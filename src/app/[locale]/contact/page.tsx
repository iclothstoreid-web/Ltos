import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { ContactCard } from '@/components/contact/ContactCard'
import { MapPlaceholder } from '@/components/contact/MapPlaceholder'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { breadcrumbSchema, organizationSchema, websiteSchema } from '@/lib/seo/schema'
import { buildLocationLocalBusinessSchema } from '@/lib/seo/localBusiness'
import { buildSimplePageMetadata } from '@/lib/marketing/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { CITY_CONFIGS } from '@/lib/seo/cityConfig'

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(
    buildSimplePageMetadata({
      title: 'Contact',
      description: 'Alamat, WhatsApp, dan jam operasional Tarda Bogor — hubungi kami untuk konsultasi bespoke tailoring.',
      path: '/contact',
    }),
    FABRIC_SITE_ORIGIN,
    '/contact'
  )
}

const BREADCRUMB_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Contact', path: '/contact' },
]

// Sprint W8-B §4 — Local Citation Infrastructure landing page. Reuses the
// Bogor CityConfig entry's LocalBusiness schema (buildLocationLocalBusinessSchema
// already carries the one real address + geo) rather than a new one-off
// schema shape for this page.
const bogor = CITY_CONFIGS.find((city) => city.isPrimary)!

export default function ContactPage() {
  return (
    <div className="bg-luxury-navy-deep">
      <JsonLd
        data={[
          buildLocationLocalBusinessSchema(bogor),
          breadcrumbSchema(BREADCRUMB_ITEMS),
          organizationSchema(),
          websiteSchema(),
        ]}
      />
      <Nav />
      <main>
        <section className="relative overflow-hidden px-6 py-24 text-center md:px-10 md:py-32">
          <LuxuryGradientField variant="a" />
          <div className="relative mx-auto max-w-2xl">
            <Reveal>
              <GoldAccentLine className="mx-auto mb-4" />
              <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Contact</p>
              <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl">Hubungi Tarda</h1>
              <p className="mx-auto mt-6 max-w-xl font-luxury-sans text-base text-luxury-taupe md:text-lg">
                Konsultasi, pengukuran, dan produksi berlangsung di workshop kami di Bogor — hubungi kami via WhatsApp untuk memulai.
              </p>
            </Reveal>
            <Breadcrumbs items={BREADCRUMB_ITEMS} />
          </div>
        </section>

        <section aria-labelledby="contact-details-heading" className="px-6 pb-24 md:px-10">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <h2 id="contact-details-heading" className="sr-only">
              Detail Kontak
            </h2>
            <ContactCard />
            <MapPlaceholder />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
