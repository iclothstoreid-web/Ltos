import Link from 'next/link'

interface DesignStudioCtaProps {
  slug: string
  className?: string
}

// §11 — plain query param, no Design Studio integration this sprint
// ("Belum perlu integrasi otomatis. Cukup URL parameter.") — Design Studio
// itself is untouched, per this sprint's explicit boundary.
export function DesignStudioCta({ slug, className = '' }: DesignStudioCtaProps) {
  return (
    <Link
      href={`/design-studio?fabric=${encodeURIComponent(slug)}`}
      className={`inline-flex items-center justify-center rounded-full bg-luxury-gold px-6 py-3 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-black transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-luxury-gold/50 ${className}`}
    >
      Customize This Fabric
    </Link>
  )
}
