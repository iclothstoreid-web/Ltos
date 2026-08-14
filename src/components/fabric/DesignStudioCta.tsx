'use client'

import Link from 'next/link'
import { buildDesignStudioHref } from '@/lib/materials/colorUrlHelpers'
import { trackCTA } from '@/lib/analytics/cta'

interface DesignStudioCtaProps {
  slug: string
  colorSlug?: string | null
  className?: string
  // Sprint W9-1 §4 — this page renders the same CTA twice (hero + footer);
  // distinguishes which one was clicked in the CTA leaderboard.
  position?: string
}

// §7/§11 — plain query param(s), no automatic Design Studio integration
// beyond reading them ("Belum perlu integrasi otomatis. Cukup URL
// parameter."). colorSlug is only appended when a color is actually
// selected — see buildDesignStudioHref.
//
// Sprint W9-1 §4/§5 — 'use client' added solely so this can fire trackCTA
// on click (the fabric-engagement `ctaClicks` weight in
// calculateFabricEngagement() is populated from this exact click); no
// other behavior changed, still a plain navigational <Link>.
export function DesignStudioCta({ slug, colorSlug = null, className = '', position = 'detail_cta' }: DesignStudioCtaProps) {
  return (
    <Link
      href={buildDesignStudioHref(slug, colorSlug)}
      onClick={() => trackCTA('fabric_detail_estimate', `/fabric/${slug}`, position, 'fabric')}
      className={`inline-flex items-center justify-center rounded-full bg-luxury-gold px-6 py-3 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-black transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-luxury-gold/50 ${className}`}
    >
      Customize This Fabric
    </Link>
  )
}
