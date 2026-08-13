import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { CITY_BUSINESS, type CityConfig } from '@/lib/seo/cityConfig'
import { appendUtmNote, type UtmParams } from '@/lib/seo/utm'

interface CityCTAProps {
  city: CityConfig
  utm?: UtmParams
}

// Sprint W8-2/3 — renamed from LocationAppointmentCta.tsx (W8-1). Sprint
// W8-B adds `utm` (see CityHero.tsx's comment for why).
export function CityCTA({ city, utm }: CityCTAProps) {
  const message = appendUtmNote(
    city.isPrimary
      ? 'Halo Local Tailor, saya ingin booking Private Appointment di workshop Bandung.'
      : `Halo Local Tailor, saya di ${city.city} dan ingin konsultasi untuk custom thobe.`,
    utm ?? {}
  )
  const whatsappUrl = buildContentWhatsAppUrl(CITY_BUSINESS.whatsappInternational, message)

  return (
    <section aria-labelledby="city-cta-heading" className="bg-luxury-navy-deep px-6 py-24 text-center md:px-10">
      <div className="mx-auto max-w-xl">
        <Reveal>
          <h2 id="city-cta-heading" className="font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {city.isPrimary ? 'Booking Private Appointment di Bandung' : `Mulai Konsultasi dari ${city.city}`}
          </h2>
          <p className="mx-auto mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">
            {city.isPrimary
              ? 'Konsultasi, pemilihan fabric, dan pengukuran langsung di workshop kami.'
              : 'Konsultasi awal via WhatsApp — jadwal pengukuran ditentukan setelahnya.'}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary">
            Chat on WhatsApp
          </MagneticButton>
          <MagneticButton href="/book-appointment" variant="ghost">
            Book a Private Appointment
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
