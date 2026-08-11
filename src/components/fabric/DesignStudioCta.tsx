import Link from 'next/link'
import { buildDesignStudioHref } from '@/lib/materials/colorUrlHelpers'

interface DesignStudioCtaProps {
  slug: string
  colorSlug?: string | null
  className?: string
}

// §7/§11 — plain query param(s), no automatic Design Studio integration
// beyond reading them ("Belum perlu integrasi otomatis. Cukup URL
// parameter."). colorSlug is only appended when a color is actually
// selected — see buildDesignStudioHref.
export function DesignStudioCta({ slug, colorSlug = null, className = '' }: DesignStudioCtaProps) {
  return (
    <Link
      href={buildDesignStudioHref(slug, colorSlug)}
      className={`inline-flex items-center justify-center rounded-full bg-luxury-gold px-6 py-3 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-black transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-luxury-gold/50 ${className}`}
    >
      Customize This Fabric
    </Link>
  )
}
