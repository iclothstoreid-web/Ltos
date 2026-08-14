'use client'

import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { trackCTA } from '@/lib/analytics/cta'
import { trackEvent } from '@/lib/analytics/tracker'
import type { PageType } from '@/lib/analytics/types'

interface TrackedMagneticButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
  target?: string
  rel?: string
  ctaId: string
  ctaPage: string
  ctaPosition: string
  pageType?: PageType
  /** Also fires this named taxonomy event (e.g. consultation_cta_click) alongside the generic cta_click — for CTAs that map to their own §2 event, not just the CTA-leaderboard's generic one. */
  extraEvent?: string
}

// Sprint W9-1 §4 — CTA-tracked wrapper around MagneticButton, for use from
// Server Component pages (book-appointment, locations, contact, etc.),
// which cannot pass an inline onClick function prop across the server/
// client boundary directly. The onClick handler lives here, inside a
// client module, so the server page only ever passes serializable string
// props (ctaId/ctaPage/ctaPosition) — never a function.
export function TrackedMagneticButton({ href, children, variant, className, target, rel, ctaId, ctaPage, ctaPosition, pageType, extraEvent }: TrackedMagneticButtonProps) {
  return (
    <MagneticButton
      href={href}
      variant={variant}
      className={className}
      target={target}
      rel={rel}
      onClick={() => {
        trackCTA(ctaId, ctaPage, ctaPosition, pageType)
        if (extraEvent) trackEvent(extraEvent, { cta_id: ctaId }, { pageType })
      }}
    >
      {children}
    </MagneticButton>
  )
}
