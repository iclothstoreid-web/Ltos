import type { Metadata } from 'next'
import { buildSimplePageMetadata } from '@/lib/marketing/seo'
import { appointmentCopy } from '@/lib/marketing/copy'
import { buildContentWhatsAppUrl, CONTENT_WHATSAPP_NUMBER } from '@/lib/content/whatsapp'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { breadcrumbSchema, faqSchema, type FaqSchemaItem } from '@/lib/seo/schema'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { FaqSection } from '@/components/seo/FaqSection'

export const metadata: Metadata = buildSimplePageMetadata({
  title: 'Book a Private Appointment',
  description: appointmentCopy.body,
  path: '/book-appointment',
})

const BOOKING_MESSAGE = 'Halo Local Tailor, saya ingin booking Private Appointment untuk konsultasi dan pengukuran.'

// Sprint W7-4 — consultation-stand-in FAQ (this repo has no dedicated
// /consultation route; /book-appointment is the real page that leads a
// visitor into one). Grounded only in facts already established elsewhere
// in this codebase: appointmentCopy's own description of what the session
// covers, and materials/seo.ts's documented reason bespoke garments carry
// no fixed public price (quoted per consultation, made-to-order).
const CONSULTATION_FAQ: FaqSchemaItem[] = [
  {
    question: 'Apa yang terjadi saat Private Appointment?',
    answer:
      'Sesi konsultasi personal mencakup pemilihan bahan, pengukuran badan langsung oleh fitter, dan panduan desain — semuanya dalam satu sesi privat di workshop & showroom Local Tailor di Bandung.',
  },
  {
    question: 'Apakah Private Appointment berbayar?',
    answer: 'Konsultasi awal tidak dikenakan biaya. Anda hanya membayar untuk garmen bespoke yang benar-benar dipesan.',
  },
  {
    question: 'Bagaimana cara booking Private Appointment?',
    answer: 'Booking dilakukan melalui WhatsApp — klik tombol "Chat on WhatsApp" di halaman ini untuk mengatur jadwal.',
  },
  {
    question: 'Apakah saya perlu membawa referensi desain?',
    answer:
      'Tidak wajib. Anda bisa menjelajahi pilihan Model, Kerah, Manset, Material, dan Warna langsung di Design Studio sebelum atau selama sesi konsultasi.',
  },
  {
    question: 'Berapa lama harga thobe custom bisa diketahui?',
    answer:
      'Karena setiap garmen dibuat sesuai pesanan (made-to-order), harga dikonfirmasi saat konsultasi berdasarkan material dan detail desain yang dipilih, bukan dari daftar harga tetap.',
  },
]

// Sprint W4.5 — elegant placeholder, reusing appointmentCopy (already
// written for the homepage's PrivateAppointment section) rather than new
// copy. Unlike /gallery and /journal, this one ships a fully working
// primary action on day one: every "Book Appointment" CTA across the site
// used to end at either a homepage anchor or a literal href="#" dead
// link (PrivateAppointment.tsx, FinalCta.tsx) — this WhatsApp deep link
// is the first time that action actually does something.
export default function BookAppointmentPage() {
  const whatsappUrl = buildContentWhatsAppUrl(CONTENT_WHATSAPP_NUMBER, BOOKING_MESSAGE)
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Book a Private Appointment', path: '/book-appointment' },
  ]
  const breadcrumb = breadcrumbSchema(breadcrumbItems)
  const faq = faqSchema(CONSULTATION_FAQ)

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-luxury-navy-deep px-6 py-20 text-center">
      <JsonLd data={[breadcrumb, faq]} />
      <LuxuryGradientField variant="b" />

      <div className="relative mx-auto max-w-xl">
        <Breadcrumbs items={breadcrumbItems} />
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

      <div className="relative mx-auto w-full">
        <FaqSection items={CONSULTATION_FAQ} headingId="appointment-faq-heading" />
      </div>
    </main>
  )
}
