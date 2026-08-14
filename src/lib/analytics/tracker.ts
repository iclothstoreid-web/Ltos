import { gtag } from './ga4'
import { isAnalyticsEnabled, ANALYTICS_DEBUG, STORAGE_KEYS } from './constants'
import { getAttribution } from './attribution'
import type { DeviceType, EventParams, PageType } from './types'

// Sprint W9-1 §1 — central event dispatcher. Every tracking helper in this
// module tree (scroll.ts, cta.ts, fabricEngagement.ts, designStudioAnalytics.ts,
// funnel.ts, experiments/exposure.ts) calls trackEvent() rather than
// touching gtag directly, so standard params (§2's required list) are
// attached exactly once, in exactly one place.

/** Exported so src/lib/experiments/assignment.ts can bucket variants against the same session id trackEvent() already attaches to every event — one session identity for the whole app, not two competing ones. */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEYS.sessionId)
    if (existing) return existing
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(STORAGE_KEYS.sessionId, id)
    return id
  } catch {
    // sessionStorage can throw in privacy-restricted contexts (Safari
    // private mode, some in-app browsers) — analytics degrading to
    // session-less is preferable to crashing the page over it.
    return ''
  }
}

function getDevice(): DeviceType | undefined {
  if (typeof window === 'undefined') return undefined
  const width = window.innerWidth
  if (width < 640) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// analytics stub pattern — same as the existing
// src/components/body-estimator/WhatsAppCTAButton.tsx convention
// (console.debug in non-production so the event stream is visible while
// developing without a real GA4 property configured).
function debugLog(name: string, params: EventParams): void {
  if (ANALYTICS_DEBUG || process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${name}`, params)
  }
}

export interface TrackEventOptions {
  pageType?: PageType
  customerToken?: string
  city?: string
  userId?: string
}

/** Fires a GA4 event with standard params attached. Safe to call unconditionally — no-ops (after debug-logging) when analytics is disabled or gtag isn't loaded. */
export function trackEvent(name: string, params: Record<string, string | number | boolean | undefined> = {}, options: TrackEventOptions = {}): void {
  const attribution = getAttribution()

  const fullParams: EventParams = {
    session_id: getOrCreateSessionId() || undefined,
    user_id: options.userId,
    customer_token: options.customerToken,
    city: options.city,
    device: getDevice(),
    traffic_source: attribution?.lastTouch?.source,
    campaign: attribution?.lastTouch?.campaign,
    page_type: options.pageType,
    ...params,
  }

  debugLog(name, fullParams)

  if (!isAnalyticsEnabled()) return
  gtag('event', name, fullParams)
}

export function trackPageView(pageType: PageType, options: TrackEventOptions = {}): void {
  if (typeof window === 'undefined') return
  trackEvent('page_view', { page_path: window.location.pathname, page_title: document.title }, { ...options, pageType })
}
