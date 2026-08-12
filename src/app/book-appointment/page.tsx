import type { Metadata } from 'next'
import { buildSimplePageMetadata } from '@/lib/marketing/seo'
import { appointmentCopy } from '@/lib/marketing/copy'
import { buildContentWhatsAppUrl, CONTENT_WHATSAPP_NUMBER } from '@/lib/content/whatsapp'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'

export const metadata: Metadata = buildSimplePageMetadata({
  title: 'Book a Private Appointment',
  description: appointmentCopy.body,
  path: '/book-appointment',
})

const BOOKING_MESSAGE = 'Halo Local Tailor, saya ingin booking Private Appointment untuk konsultasi dan pengukuran.'

// Sprint W4.5 — elegant placeholder, reusing appointmentCopy (already
// written for the homepage's PrivateAppointment section) rather than new
// copy. Unlike /gallery and /journal, this one ships a fully working
// primary action on day one: every "Book Appointment" CTA across the site
// used to end at either a homepage anchor or a literal href="#" dead
// link (PrivateAppointment.tsx, FinalCta.tsx) — this WhatsApp deep link
// is the first time that action actually does something.
export default function BookAppointmentPage() {
  const whatsappUrl = buildContentWhatsAppUrl(CONTENT_WHATSAPP_NUMBER, BOOKING_MESSAGE)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-luxury-navy-deep px-6 py-20 text-center">
      <LuxuryGradientField variant="b" />

      <div className="relative mx-auto max-w-xl">
        <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">{appointmentCopy.eyebrow}</p>
        <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl">{appointmentCopy.heading}</h1>
        <p className="mx-auto mt-6 max-w-md font-luxury-sans text-base text-luxury-taupe md:text-lg">{appointmentCopy.body}</p>
        <p className="mt-4 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe/80">
          {appointmentCopy.location} — {appointmentCopy.address}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary">
            Chat on WhatsApp
          </MagneticButton>
          <MagneticButton href="/" variant="ghost">
            Back to Home
          </MagneticButton>
        </div>
      </div>
    </div>
  )
}
