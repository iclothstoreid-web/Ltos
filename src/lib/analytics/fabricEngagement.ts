import { trackEvent } from './tracker'
import { GA4_EVENTS } from './events'
import type { FabricEngagementSnapshot } from './types'

// Sprint W9-1 §5 — Fabric Engagement Analytics.

export function trackFabricCardView(materialId: string, position: number): void {
  trackEvent(GA4_EVENTS.cardView, { material_id: materialId, position }, { pageType: 'fabric' })
}

export function trackFabricDetailOpen(materialId: string): void {
  trackEvent(GA4_EVENTS.detailOpen, { material_id: materialId }, { pageType: 'fabric' })
}

export function trackFabricFilterUse(filterType: string, filterValue: string): void {
  trackEvent(GA4_EVENTS.filterUse, { filter_type: filterType, filter_value: filterValue }, { pageType: 'fabric' })
}

export function trackFabricCompare(materialIds: string[]): void {
  trackEvent(GA4_EVENTS.compare, { material_ids: materialIds.join(','), compare_count: materialIds.length }, { pageType: 'fabric' })
}

export function trackFabricSave(materialId: string): void {
  trackEvent(GA4_EVENTS.save, { material_id: materialId }, { pageType: 'fabric' })
}

/**
 * Call on unmount (or navigation away) with the mount timestamp captured
 * at view-start — fires fabric_time_spent once per view, not on an
 * interval, so it doesn't spam events for a page left open in a background
 * tab.
 */
export function trackFabricTimeSpent(materialId: string, viewStartedAt: number): void {
  const timeSpentMs = Date.now() - viewStartedAt
  trackEvent(GA4_EVENTS.timeSpent, { material_id: materialId, time_spent_ms: timeSpentMs }, { pageType: 'fabric' })
}

/**
 * Sprint W9-1 §5's required helper. A simple, transparent weighted score —
 * not a black-box model — so the CRO dashboard's "fabric ranking" can sort
 * materials by real engagement signal once event data exists. Weights
 * reflect increasing purchase intent: a save or CTA click signals far more
 * intent than a passive card view.
 */
export function calculateFabricEngagement(snapshot: FabricEngagementSnapshot): number {
  const WEIGHTS = {
    cardView: 1,
    detailOpen: 3,
    compare: 4,
    save: 6,
    ctaClick: 10,
    timeSpentPerMinute: 2,
  }

  const timeSpentMinutes = snapshot.timeSpentMs / 60_000

  return (
    snapshot.cardViews * WEIGHTS.cardView +
    snapshot.detailOpens * WEIGHTS.detailOpen +
    snapshot.compareCount * WEIGHTS.compare +
    snapshot.saveCount * WEIGHTS.save +
    snapshot.ctaClicks * WEIGHTS.ctaClick +
    timeSpentMinutes * WEIGHTS.timeSpentPerMinute
  )
}
