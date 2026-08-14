import { trackEvent } from '@/lib/analytics/tracker'
import { GA4_EVENTS } from '@/lib/analytics/events'
import { setClarityTag } from '@/lib/analytics/heatmap'

// Sprint W9-1 §10 — exposure tracking. Deliberately separate from
// assignment (getVariant()): a visitor can be *assigned* a variant without
// ever actually seeing it rendered (e.g. it's assigned on load but the
// component that would show it never mounts on that page). Call this only
// from the point in a component where the variant is genuinely rendered,
// so exposure counts — and therefore the eventual conversion-rate
// denominator — reflect real impressions, not just bucket assignments.
const exposedThisSession = new Set<string>()

export function trackExperimentExposure(experimentId: string, variantId: string): void {
  const key = `${experimentId}:${variantId}`
  if (exposedThisSession.has(key)) return
  exposedThisSession.add(key)

  trackEvent(GA4_EVENTS.exposure, { experiment_id: experimentId, variant_id: variantId })
  setClarityTag(`exp_${experimentId}`, variantId)
}
