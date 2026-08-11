'use client'

import { trackConsultationStarted } from '@/lib/configurator/analytics'

interface ConsultationCtaProps {
  designId?: string
  label?: string
  className: string
}

// Shared by SaveDesignModal's success state and /design/[slug] — links into
// the real marketing homepage appointment anchor (src/components/marketing/
// shell/Nav.tsx already uses the same "/#appointment" target), so this
// isn't a dead link even though there's no dedicated booking flow yet.
export function ConsultationCta({ designId, label = 'Mulai Konsultasi', className }: ConsultationCtaProps) {
  return (
    <a href="/#appointment" onClick={() => trackConsultationStarted(designId)} className={className}>
      {label}
    </a>
  )
}
