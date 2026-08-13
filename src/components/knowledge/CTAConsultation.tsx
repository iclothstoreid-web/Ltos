import Link from 'next/link'

interface CTAConsultationProps {
  // Sprint W6-10 — commercial funnel layer. Same real route
  // (/book-appointment) every time; only the label varies so a wedding
  // article can say "Konsultasi Pernikahan Gratis" and an umrah article
  // "Konsultasi Umrah Gratis" without inventing separate booking routes
  // that don't exist.
  label?: string
}

// Plain server-rendered <Link> (no MagneticButton) — Knowledge pages need
// zero interactivity, so pulling in MagneticButton's client-side cursor
// physics for a static CTA would be an unnecessary client boundary on a
// page that's otherwise 100% Server Components (performance requirement).
export function CTAConsultation({ label = 'Konsultasi Gratis' }: CTAConsultationProps = {}) {
  return (
    <Link
      href="/book-appointment"
      className="inline-flex w-full items-center justify-center rounded-full bg-luxury-gold px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-black transition duration-300 hover:brightness-110 sm:w-auto"
    >
      {label}
    </Link>
  )
}
