// Sprint W9-1 — shared types for the analytics layer.

// Sprint W9-1 §Website Funnel — the 7 page roles every tracked page maps
// to. Deliberately a closed union (not a bare string) so a typo in a
// page_type param is a compile error, not a silent taxonomy drift.
export type PageType =
  | 'landing'
  | 'fabric'
  | 'lookbook'
  | 'configurator'
  | 'consultation'
  | 'measurement'
  | 'quotation'
  | 'order'
  | 'other'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

// Standard parameters attached to every event this layer fires — the
// brief's own required list. All optional here because several are only
// resolvable client-side after hydration (app_session_id) or only meaningful
// on certain pages (customer_token, city) — tracker.ts fills in whatever it
// can from context and omits the rest, rather than sending empty strings.
//
// `app_session_id` (not `session_id`): `session_id` is a reserved GA4
// parameter that overrides GA4's own session id. See tracker.ts.
export interface StandardEventParams {
  app_session_id?: string
  user_id?: string
  customer_token?: string
  city?: string
  device?: DeviceType
  traffic_source?: string
  campaign?: string
  page_type?: PageType
}

// Event payloads are StandardEventParams plus whatever event-specific
// fields that event needs — kept as a loose (but never `any`) index type
// since GA4 itself accepts arbitrary custom parameters per event.
export type EventParams = StandardEventParams & Record<string, string | number | boolean | undefined>

export interface AttributionTouch {
  source: string
  medium: string
  campaign?: string
  term?: string
  content?: string
  landingPage: string
  timestamp: number
}

export interface FabricEngagementSnapshot {
  materialId: string
  cardViews: number
  detailOpens: number
  compareCount: number
  saveCount: number
  ctaClicks: number
  timeSpentMs: number
}

export interface FunnelStepEvent {
  step: string
  stepIndex: number
  sessionId: string
  timestamp: number
}
