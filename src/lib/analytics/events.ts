// Sprint W9-1 §2 — GA4 Event Taxonomy. One frozen object per category, all
// merged into GA4_EVENTS below so every event name is defined exactly
// once — the module itself is the single source of truth a duplicate-name
// bug would have to survive past (TypeScript rejects two keys with the
// same value only if compared explicitly, so `assertNoDuplicateEventNames`
// at the bottom of this file does that check for real, at module load).

export const LANDING_EVENTS = {
  pageView: 'page_view',
  heroView: 'hero_view',
  heroCtaClick: 'hero_cta_click',
} as const

export const SCROLL_EVENTS = {
  scroll25: 'scroll_25',
  scroll50: 'scroll_50',
  scroll75: 'scroll_75',
  scroll100: 'scroll_100',
} as const

export const FABRIC_EVENTS = {
  cardView: 'fabric_card_view',
  detailOpen: 'fabric_detail_open',
  filterUse: 'fabric_filter_use',
  compare: 'fabric_compare',
} as const

export const LOOKBOOK_EVENTS = {
  open: 'lookbook_open',
} as const

export const DESIGN_STUDIO_EVENTS = {
  configuratorStart: 'configurator_start',
  fabricSelected: 'fabric_selected',
  collarSelected: 'collar_selected',
  cuffSelected: 'cuff_selected',
  embroiderySelected: 'embroidery_selected',
  configuratorComplete: 'configurator_complete',
  configuratorExit: 'configurator_exit',
} as const

export const CONSULTATION_EVENTS = {
  ctaClick: 'consultation_cta_click',
  formOpen: 'consultation_form_open',
  formSubmit: 'consultation_form_submit',
  scheduled: 'consultation_scheduled',
  attended: 'consultation_attended',
} as const

export const MEASUREMENT_EVENTS = {
  started: 'measurement_started',
  completed: 'measurement_completed',
} as const

export const COMMERCIAL_EVENTS = {
  quotationGenerated: 'quotation_generated',
  orderConfirmed: 'order_confirmed',
  paymentDp: 'payment_dp',
  paymentFull: 'payment_full',
} as const

// Sprint W9-1 §4/§5 — CTA and fabric-engagement events aren't in the
// brief's §2 taxonomy list verbatim, but §4/§5 require a `trackCTA` helper
// and fabric engagement tracking that need their own event names to fire
// under. Named distinctly from the FABRIC_EVENTS above so nothing collides.
export const CTA_EVENTS = {
  click: 'cta_click',
} as const

export const FABRIC_ENGAGEMENT_EVENTS = {
  save: 'fabric_save',
  timeSpent: 'fabric_time_spent',
} as const

// Sprint W9-1 §10 — experiment exposure, needed by src/lib/experiments/exposure.ts.
export const EXPERIMENT_EVENTS = {
  exposure: 'experiment_exposure',
} as const

// Sprint W9-1 §7 — one generic event for the Conversion Funnel layer
// (funnel.ts), carrying `funnel_step`/`funnel_step_index` params. Kept
// separate from the step-specific events above (page_view,
// configurator_start, consultation_cta_click, etc., which still fire on
// their own) so the CRO dashboard can build a funnel view directly from
// one event stream without needing to know every taxonomy event's
// page_type mapping by heart.
export const FUNNEL_EVENTS = {
  step: 'funnel_step',
} as const

export const GA4_EVENTS = {
  ...LANDING_EVENTS,
  ...SCROLL_EVENTS,
  ...FABRIC_EVENTS,
  ...LOOKBOOK_EVENTS,
  ...DESIGN_STUDIO_EVENTS,
  ...CONSULTATION_EVENTS,
  ...MEASUREMENT_EVENTS,
  ...COMMERCIAL_EVENTS,
  ...CTA_EVENTS,
  ...FABRIC_ENGAGEMENT_EVENTS,
  ...EXPERIMENT_EVENTS,
  ...FUNNEL_EVENTS,
} as const

export type Ga4EventName = (typeof GA4_EVENTS)[keyof typeof GA4_EVENTS]

// Runs once at module load (not exported, not gated on NODE_ENV) — if a
// future edit ever introduces a duplicate event-name string across two
// categories, every page importing this module throws immediately in dev
// and in CI (next build evaluates modules), rather than silently merging
// two different categories' events into one GA4 event name in production.
function assertNoDuplicateEventNames(): void {
  const allValues = [
    ...Object.values(LANDING_EVENTS),
    ...Object.values(SCROLL_EVENTS),
    ...Object.values(FABRIC_EVENTS),
    ...Object.values(LOOKBOOK_EVENTS),
    ...Object.values(DESIGN_STUDIO_EVENTS),
    ...Object.values(CONSULTATION_EVENTS),
    ...Object.values(MEASUREMENT_EVENTS),
    ...Object.values(COMMERCIAL_EVENTS),
    ...Object.values(CTA_EVENTS),
    ...Object.values(FABRIC_ENGAGEMENT_EVENTS),
    ...Object.values(EXPERIMENT_EVENTS),
    ...Object.values(FUNNEL_EVENTS),
  ]
  const seen = new Set<string>()
  for (const value of allValues) {
    if (seen.has(value)) {
      throw new Error(`[analytics] duplicate GA4 event name detected: "${value}"`)
    }
    seen.add(value)
  }
}

assertNoDuplicateEventNames()
