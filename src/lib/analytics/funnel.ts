import { trackEvent } from './tracker'
import { GA4_EVENTS } from './events'
import type { PageType } from './types'

// Sprint W9-1 §7 — Conversion Funnel layer. One canonical funnel
// definition (Website Funnel) matching the brief's own diagram —
// docs/analytics/FUNNEL_ARCHITECTURE.md documents this same list so the
// two can never drift.
export const WEBSITE_FUNNEL_STEPS = [
  'landing',
  'fabric',
  'configurator',
  'consultation',
  'measurement',
  'quotation',
  'order',
] as const

export type WebsiteFunnelStep = (typeof WEBSITE_FUNNEL_STEPS)[number]

const STEP_TO_PAGE_TYPE: Record<WebsiteFunnelStep, PageType> = {
  landing: 'landing',
  fabric: 'fabric',
  configurator: 'configurator',
  consultation: 'consultation',
  measurement: 'measurement',
  quotation: 'quotation',
  order: 'order',
}

export function getFunnelStepIndex(step: WebsiteFunnelStep): number {
  return WEBSITE_FUNNEL_STEPS.indexOf(step)
}

/**
 * Fires a `funnel_step` event carrying the step's position in
 * WEBSITE_FUNNEL_STEPS — the CRO dashboard's funnel/drop-off view groups
 * on `funnel_step_index`, not just the step name, so step order survives
 * even if a future edit reorders the display labels.
 */
export function trackFunnelStep(step: WebsiteFunnelStep, extraParams: Record<string, string | number | boolean | undefined> = {}): void {
  trackEvent(
    GA4_EVENTS.step,
    {
      funnel_step: step,
      funnel_step_index: getFunnelStepIndex(step),
      ...extraParams,
    },
    { pageType: STEP_TO_PAGE_TYPE[step] }
  )
}
