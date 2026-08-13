import Link from 'next/link'

// Sprint W6-10 — "Estimate Price" funnel CTA. Points at /design-studio,
// the real page with live price estimation (EstimasiHargaPanel) — there is
// no standalone "price calculator" route in this app, so this reuses the
// actual feature rather than inventing a new one.
export function CTAEstimatePrice() {
  return (
    <Link
      href="/design-studio"
      className="inline-flex w-full items-center justify-center font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe underline-offset-4 transition-colors hover:text-luxury-gold hover:underline sm:w-auto"
    >
      Estimasi Harga di Design Studio
    </Link>
  )
}
