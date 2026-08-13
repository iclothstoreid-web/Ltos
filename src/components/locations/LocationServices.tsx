import Link from 'next/link'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import type { LocationConfig } from '@/lib/seo/locations'

interface LocationServicesProps {
  location: LocationConfig
}

// Sprint W8-1 — "Services" section. Every card links to a real, already-
// live route — /design-studio for the configurator, and the Knowledge
// base's wedding/umrah hubs for occasion-specific guidance — rather than
// inventing new service pages this sprint (see the W7-3/W7-4 scope
// decision this project already made: schema/links on real pages, not new
// page creation for every named service).
const SERVICES = [
  {
    title: 'Bespoke Tailoring',
    description: 'Pola diformulasikan dari pengukuran tubuh Anda sendiri — bukan ukuran standar.',
    href: '/design-studio',
  },
  {
    title: 'Custom Thobe',
    description: 'Pilih Model, Kerah, Manset, Material, dan Warna langsung di Design Studio.',
    href: '/design-studio',
  },
  {
    title: 'Wedding Thobe',
    description: 'Thobe custom untuk acara akad dan resepsi, dengan pertimbangan material formal.',
    href: '/knowledge/wedding',
  },
  {
    title: 'Umrah Thobe',
    description: 'Thobe custom yang dirancang untuk kenyamanan selama ibadah umrah.',
    href: '/knowledge/umrah',
  },
] as const

export function LocationServices({ location }: LocationServicesProps) {
  return (
    <section aria-labelledby="location-services-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Layanan</p>
          <h2 id="location-services-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Layanan Bespoke Tailoring untuk Klien di {location.cityName}
          </h2>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <Reveal as="li" key={service.title} delay={i * 0.08}>
              <Link
                href={service.href}
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
