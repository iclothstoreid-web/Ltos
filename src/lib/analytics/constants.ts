// Sprint W9-1 — Analytics Foundation. Single source of config for every
// module under src/lib/analytics/ and src/lib/experiments/.
//
// TODO_PLACEHOLDER_ENV — same convention as NEXT_PUBLIC_WHATSAPP_NUMBER
// elsewhere in this codebase (see src/lib/content/whatsapp.ts): these read
// from env vars that don't exist in .env.local yet. No GA4 property,
// Clarity project, or PostHog key has been provisioned for this project —
// every loader in this module tree treats an empty/unset ID as "disabled"
// and no-ops rather than fabricating a fake ID that would silently fail
// (or worse, silently send real traffic to nobody's dashboard).
export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || ''
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ''

// Analytics is env-safe by default: disabled outside production unless
// explicitly opted into for local debugging via NEXT_PUBLIC_ANALYTICS_DEBUG.
// This matches the brief's own "Analytics boleh dimatikan di development"
// requirement without needing a build-time branch.
export const ANALYTICS_DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

/** True only when a real measurement ID exists AND we're either in production or debug mode is explicitly on. */
export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (!GA4_MEASUREMENT_ID) return false
  return IS_PRODUCTION || ANALYTICS_DEBUG
}

export function isHeatmapEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (!CLARITY_PROJECT_ID) return false
  return IS_PRODUCTION || ANALYTICS_DEBUG
}

// localStorage/sessionStorage keys — centralized so tracker.ts and
// attribution.ts never risk drifting on the exact key string.
export const STORAGE_KEYS = {
  sessionId: 'ltos_session_id',
  firstTouch: 'ltos_first_touch',
  lastTouch: 'ltos_last_touch',
  experimentAssignments: 'ltos_experiment_assignments',
} as const

export const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const
// Throttle window for the scroll listener itself (distinct from the
// once-per-threshold firing logic in scroll.ts).
export const SCROLL_THROTTLE_MS = 200
