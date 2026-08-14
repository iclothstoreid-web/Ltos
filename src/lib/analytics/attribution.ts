import { STORAGE_KEYS } from './constants'
import type { AttributionTouch } from './types'

// Sprint W9-1 §8 — Attribution Layer. UTM parsing + source/medium
// normalization + first-touch/last-touch persistence, all pure
// localStorage — no server round-trip, no new Supabase table (this is
// client-side marketing attribution, not an order-of-record).

const SOURCE_ALIASES: Record<string, string> = {
  'google.com': 'google',
  'www.google.com': 'google',
  'm.facebook.com': 'facebook',
  'www.facebook.com': 'facebook',
  'l.facebook.com': 'facebook',
  'instagram.com': 'instagram',
  'www.instagram.com': 'instagram',
  'l.instagram.com': 'instagram',
  'wa.me': 'whatsapp',
  'api.whatsapp.com': 'whatsapp',
  'web.whatsapp.com': 'whatsapp',
  't.co': 'twitter',
  'twitter.com': 'twitter',
  'x.com': 'twitter',
  'business.google.com': 'google_business',
  'google_business': 'google_business',
  'gbp': 'google_business',
}

const MEDIUM_ALIASES: Record<string, string> = {
  cpc: 'cpc',
  ppc: 'cpc',
  paid: 'cpc',
  paidsocial: 'social',
  social: 'social',
  organic: 'organic',
  referral: 'referral',
  email: 'email',
  gbp: 'local',
  local: 'local',
}

export function normalizeSource(rawSource: string | null | undefined): string {
  if (!rawSource) return 'direct'
  const lower = rawSource.toLowerCase().trim()
  return SOURCE_ALIASES[lower] ?? lower
}

export function normalizeMedium(rawMedium: string | null | undefined): string {
  if (!rawMedium) return 'none'
  const lower = rawMedium.toLowerCase().trim()
  return MEDIUM_ALIASES[lower] ?? lower
}

/** Parses utm_* params from a URLSearchParams. Falls back to document.referrer's hostname as `source` (medium: 'referral') when no UTM params are present, or 'direct'/'none' when there's no referrer either (a typed-URL or bookmark visit). */
export function parseUtmParams(searchParams: URLSearchParams): AttributionTouch {
  const utmSource = searchParams.get('utm_source')
  const utmMedium = searchParams.get('utm_medium')
  const utmCampaign = searchParams.get('utm_campaign') ?? undefined
  const utmTerm = searchParams.get('utm_term') ?? undefined
  const utmContent = searchParams.get('utm_content') ?? undefined

  let source = utmSource
  let medium = utmMedium

  if (!source && typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerHost = new URL(document.referrer).hostname
      source = referrerHost
      medium = medium ?? 'referral'
    } catch {
      // malformed referrer — fall through to direct/none below
    }
  }

  return {
    source: normalizeSource(source),
    medium: normalizeMedium(medium),
    campaign: utmCampaign,
    term: utmTerm,
    content: utmContent,
    landingPage: typeof window !== 'undefined' ? window.location.pathname : '',
    timestamp: Date.now(),
  }
}

function readTouch(key: string): AttributionTouch | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as AttributionTouch) : null
  } catch {
    return null
  }
}

function writeTouch(key: string, touch: AttributionTouch): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(touch))
  } catch {
    // localStorage can throw when full/disabled — attribution degrading
    // silently is preferable to crashing the page over it.
  }
}

/**
 * Call once per page load (see AnalyticsProvider). Persists this visit as
 * first-touch if none exists yet, and always overwrites last-touch —
 * standard first-touch/last-touch attribution model (see
 * docs/analytics/ATTRIBUTION_MODEL.md for which reports use which).
 */
export function captureAttribution(searchParams: URLSearchParams): void {
  const touch = parseUtmParams(searchParams)

  if (!readTouch(STORAGE_KEYS.firstTouch)) {
    writeTouch(STORAGE_KEYS.firstTouch, touch)
  }
  writeTouch(STORAGE_KEYS.lastTouch, touch)
}

export function getAttribution(): { firstTouch: AttributionTouch | null; lastTouch: AttributionTouch | null } {
  return {
    firstTouch: readTouch(STORAGE_KEYS.firstTouch),
    lastTouch: readTouch(STORAGE_KEYS.lastTouch),
  }
}
