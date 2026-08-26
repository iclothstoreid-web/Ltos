import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { breadcrumbSchema, organizationSchema, websiteSchema, faqSchema } from '@/lib/seo/schema'
import { buildLocationsHubLocalBusinessSchema } from '@/lib/seo/localBusiness'
import { buildLocationsHubMetadata } from '@/lib/seo/locationMetadata'
import { CITY_CONFIGS, CITY_BUSINESS, CITY_SITE_ORIGIN, getCitiesByRegion } from '@/lib/seo/cityConfig'
import { withLocaleAlternates } from '@/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(buildLocationsHubMetadata(), CITY_SITE_ORIGIN, '/locations')
}

const BREADCRUMB_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Locations', path: '/locations' },
]

// Sprint W6R.2 — honest positioning only: explains the real remote-
// consultation model (same facts REMOTE_CONSULTATION_FAQ in cityConfig.ts
// already states on every non-Bandung city page), never implies a branch
// or physical presence outside Bandung.
const HUB_FAQ = [
  {
    question: 'Apakah Local Tailor punya cabang di kota selain Bandung?',
    answer:
      'Tidak. Bandung adalah satu-satunya lokasi fisik Local Tailor — tempat konsultasi tatap muka, pengukuran oleh fitter, dan seluruh produksi berlangsung. Untuk kota lain, kami melayani pelanggan melalui konsultasi jarak jauh dan pengiriman, bukan cabang.',
  },
  {
    question: 'Bagaimana proses pemesanan untuk pelanggan di luar Bandung?',
    answer:
      'Konsultasi awal dilakukan via WhatsApp — membahas model, bahan, dan kebutuhan Anda. Anda juga bisa menjelajahi kombinasi desain di Design Studio secara online. Pengukuran final untuk produksi tetap dilakukan langsung oleh fitter kami di Bandung untuk memastikan hasil yang akurat.',
  },
  {
    question: 'Apakah garmen yang sudah jadi bisa dikirim ke seluruh Indonesia?',
    answer:
      'Ya. Setiap garmen bespoke yang sudah melewati quality control dikirim ke alamat Anda di kota mana pun kami layani, termasuk seluruh kota yang terdaftar di halaman ini.',
  },
  {
    question: 'Kenapa pengukuran tidak dilakukan di kota saya langsung?',
    answer:
      'Karena pengukuran presisi untuk thobe bespoke membutuhkan fitter terlatih dan proses yang sama seperti setiap pesanan lain — saat ini seluruh pengukuran final terpusat di workshop Bandung agar standar akurasinya konsisten untuk semua pelanggan, di kota mana pun mereka berada.',
  },
]

// Upgraded from a flat city grid (W8-1/8-2/3) into a National Service Area
// Hub per Sprint W6R.2 — positioning, an honest explanation of how service
// for customers outside Bandung actually works, a region-grouped city
// directory (getCitiesByRegion(), a real grouping — never a coverage
// claim), major services, a few real Knowledge guides, FAQ, and one clear
// CTA. Adding a city still only requires one CITY_CONFIGS entry in
// cityConfig.ts — this page needs zero further changes to pick it up.
export default function LocationsHubPage() {
  const regionGroups = getCitiesByRegion()

  return (
    <div className="bg-luxury-navy-deep">
      <JsonLd
        data={[
          buildLocationsHubLocalBusinessSchema(CITY_CONFIGS),
          breadcrumbSchema(BREADCRUMB_ITEMS),
          organizationSchema(),
          websiteSchema(),
          faqSchema(HUB_FAQ),
        ]}
      />
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

        {/* Positioning + how remote service actually works — the honest
            explanation Step 9 requires, stated once here rather than
            repeated per city. */}
        <section aria-labelledby="how-it-works-heading" className="px-6 pb-20 md:px-10">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <GoldAccentLine className="mx-auto mb-4" />
              <h2 id="how-it-works-heading" className="text-center font-fraunces text-2xl text-luxury-ivory md:text-3xl">
                Bagaimana Layanan untuk Pelanggan di Luar Bandung Bekerja
              </h2>
              <p className="mt-6 font-luxury-sans text-sm leading-relaxed text-luxury-taupe md:text-base">
                Workshop dan showroom kami satu-satunya berada di Bandung — di sinilah setiap konsultasi tatap muka,
                pengukuran oleh fitter, pembentukan pola, hingga produksi berlangsung. Untuk pelanggan di kota lain,
                kami tidak membuka cabang atau menempatkan tailor di kota Anda; sebagai gantinya, konsultasi awal
                dilakukan sepenuhnya via WhatsApp, dan Anda bisa menjelajahi kombinasi Model, Kerah, Manset, Material,
                dan Warna secara online di Design Studio sebelum jadwal pengukuran final ditentukan.
              </p>
              <p className="mt-4 font-luxury-sans text-sm leading-relaxed text-luxury-taupe md:text-base">
                Pengukuran presisi tetap dilakukan langsung oleh fitter kami di Bandung — baik saat Anda berkunjung
                langsung, maupun setelah koordinasi jadwal via WhatsApp bagi pelanggan yang datang dari luar kota.
                Setiap garmen yang selesai diproduksi dan lolos quality control kemudian dikirim langsung ke alamat
                Anda, di kota mana pun kami layani.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Region-grouped city directory — a real, conventional Indonesian
            regional grouping (Jabodetabek/Jawa Barat/Jawa Tengah & DIY/Jawa
            Timur/Sumatra), never a coverage claim beyond the cities actually
            listed under each. */}
        <section aria-labelledby="locations-grid-heading" className="px-6 pb-20 md:px-10">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <h2 id="locations-grid-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
                Kota yang Kami Layani
              </h2>
              <p className="mt-3 font-luxury-sans text-sm text-luxury-taupe">
                Dikelompokkan berdasarkan wilayah untuk memudahkan Anda menemukan kota Anda.
              </p>
            </Reveal>

            <div className="flex flex-col gap-14">
              {regionGroups.map((group, gi) => (
                <Reveal key={group.region} delay={gi * 0.06}>
                  <h3 className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{group.region}</h3>
                  <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.cities.map((city) => (
                      <li key={city.slug}>
                        <Link
                          href={`/locations/${city.slug}`}
                          className="block h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-8 transition hover:border-luxury-gold/40"
                        >
                          <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
                            {city.isPrimary ? 'Workshop & Showroom' : 'Layanan Konsultasi Remote'}
                          </p>
                          <h4 className="mt-3 font-fraunces text-2xl text-luxury-ivory">Custom Thobe {city.city}</h4>
                          <p className="mt-2 font-luxury-sans text-xs text-luxury-taupe">{city.province}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Major services — real routes only, no invented paths. */}
        <section aria-labelledby="major-services-heading" className="border-y border-luxury-gold/[0.14] px-6 py-20 md:px-10">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <h2 id="major-services-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
                Mulai dari Mana Pun Anda Berada
              </h2>
            </Reveal>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Design Studio', description: 'Jelajahi Model, Kerah, Manset, Material, dan Warna, lihat estimasi harga langsung.', href: '/design-studio' },
                { title: 'Fabric Explorer', description: 'Bandingkan karakteristik dan tampilan setiap pilihan bahan sebelum memutuskan.', href: '/fabric' },
                { title: 'Book Appointment', description: 'Jadwalkan konsultasi via WhatsApp sesuai waktu Anda.', href: '/book-appointment' },
                { title: 'Free Body Profile Estimator', description: 'Dapatkan estimasi ukuran awal sebelum pengukuran final oleh fitter.', href: '/free-body-profile-estimator' },
              ].map((item, i) => (
                <Reveal as="li" key={item.href} delay={i * 0.06}>
                  <Link href={item.href} className="block h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6 transition hover:border-luxury-gold/40">
                    <h3 className="font-fraunces text-lg text-luxury-ivory">{item.title}</h3>
                    <p className="mt-2 font-luxury-sans text-xs text-luxury-taupe">{item.description}</p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Selected guides — real, live Knowledge articles only. */}
        <section aria-labelledby="selected-guides-heading" className="px-6 py-20 md:px-10">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <h2 id="selected-guides-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
                Panduan Terkait
              </h2>
            </Reveal>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Apa Itu Bespoke?', href: '/knowledge/tailoring/what-is-bespoke' },
                { title: 'Cara Mengukur Badan Sendiri', href: '/knowledge/measurements/how-to-measure-body' },
                { title: 'Panduan Bahan Thobe', href: '/knowledge/fabrics' },
                { title: 'Panduan Thobe Umrah', href: '/knowledge/umrah' },
              ].map((item, i) => (
                <Reveal as="li" key={item.href} delay={i * 0.06}>
                  <Link
                    href={item.href}
                    className="block h-full rounded-sm border border-luxury-gold/[0.10] p-6 text-center font-luxury-sans text-sm text-luxury-ivory transition hover:border-luxury-gold/40 hover:text-luxury-gold"
                  >
                    {item.title}
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="hub-faq-heading" className="border-t border-luxury-gold/[0.14] px-6 py-20 md:px-10">
          <div className="mx-auto max-w-3xl">
            <Reveal className="text-center">
              <h2 id="hub-faq-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
                Pertanyaan Umum
              </h2>
            </Reveal>
            <div className="mt-10 divide-y divide-luxury-gold/[0.14]">
              {HUB_FAQ.map((item, i) => (
                <Reveal key={item.question} delay={i * 0.05}>
                  <details className="group py-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-luxury-sans text-sm text-luxury-ivory">
                      <h3 className="font-fraunces text-base font-normal md:text-lg">{item.question}</h3>
                      <span aria-hidden="true" className="ml-4 shrink-0 text-luxury-gold transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{item.answer}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="hub-cta-heading" className="relative overflow-hidden px-6 py-24 text-center md:px-10">
          <LuxuryGradientField variant="b" />
          <Reveal className="relative mx-auto max-w-xl">
            <h2 id="hub-cta-heading" className="font-fraunces text-3xl text-luxury-ivory md:text-4xl">
              Mulai Konsultasi dari Kota Anda
            </h2>
            <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
              Konsultasi via WhatsApp tersedia untuk pelanggan di seluruh kota yang kami layani.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton href="/book-appointment" variant="primary">
                Book Appointment
              </MagneticButton>
              <MagneticButton href="/design-studio" variant="ghost">
                Mulai di Design Studio
              </MagneticButton>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </div>
  )
}
