'use client'

import { useEffect } from 'react'
import { trackFunnelStep, type WebsiteFunnelStep } from '@/lib/analytics/funnel'

interface FunnelStepOnMountProps {
  step: WebsiteFunnelStep
}

// Sprint W9-1 §7/§15 — mountable one-shot funnel-step tracker, mirrors
// EventOnMount but calls the typed trackFunnelStep() helper directly so
// funnel_step_index always stays derived from WEBSITE_FUNNEL_STEPS instead
// of being hand-typed at each call site.
export function FunnelStepOnMount({ step }: FunnelStepOnMountProps) {
  useEffect(() => {
    trackFunnelStep(step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
