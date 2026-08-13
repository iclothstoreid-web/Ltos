import Link from 'next/link'

export function CTABodyProfile() {
  return (
    <Link
      href="/free-body-profile-estimator"
      className="inline-flex w-full items-center justify-center font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe underline-offset-4 transition-colors hover:text-luxury-gold hover:underline sm:w-auto"
    >
      Cek Digital Body Profile Gratis
    </Link>
  )
}
