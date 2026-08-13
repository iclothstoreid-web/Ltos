import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { LOCATION_BUSINESS, type LocationConfig } from '@/lib/seo/locations'

interface LocationAppointmentCtaProps {
  location: LocationConfig
}

export function LocationAppointmentCta({ location }: LocationAppointmentCtaProps) {
  const message = location.isPrimary
    ? 'Halo Local Tailor, saya ingin booking Private Appointment di workshop Bandung.'
    : `Halo Local Tailor, saya di ${location.cityName} dan ingin konsultasi untuk custom thobe.`
  const whatsappUrl = buildContentWhatsAppUrl(LOCATION_BUSINESS.whatsappInternational, message)

  return (
    <section aria-labelledby="location-appointment-heading" className="bg-luxury-navy-deep px-6 py-24 text-center md:px-10">
      <div className="mx-auto max-w-xl">
        <Reveal>
          <h2 id="location-appointment-heading" className="font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {location.isPrimary ? 'Booking Private Appointment di Bandung' : `Mulai Konsultasi dari ${location.cityName}`}
          </h2>
          <p className="mx-auto mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">
            {location.isPrimary
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
