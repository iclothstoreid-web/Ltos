import Link from 'next/link'

// Plain server-rendered <Link> (no MagneticButton) — Knowledge pages need
// zero interactivity, so pulling in MagneticButton's client-side cursor
// physics for a static CTA would be an unnecessary client boundary on a
// page that's otherwise 100% Server Components (performance requirement).
export function CTAConsultation() {
  return (
    <Link
      href="/book-appointment"
      className="inline-flex w-full items-center justify-center rounded-full bg-luxury-gold px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-black transition duration-300 hover:brightness-110 sm:w-auto"
    >
      Konsultasi Gratis
    </Link>
  )
}
