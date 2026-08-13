// Sprint W8-B §6 — "UTM parameter support untuk Google Business traffic".
// This project has no analytics provider wired in yet (grepped the
// codebase — nothing beyond the existing analytics-stub console.debug
// pattern in src/components/body-estimator/WhatsAppCTAButton.tsx). Rather
// than fabricate a fake GA/GTM integration, UTM params are captured from
// the page's own searchParams (the same mechanism Google Business Profile
// uses to append tracking to a listing's website link) and threaded
// through into the WhatsApp message text itself — so attribution survives
// the WhatsApp handoff even without a server-side analytics call, and a
// human on the receiving end can see where the lead came from.

export interface UtmParams {
  source?: string
  medium?: string
  campaign?: string
}

type SearchParamsInput = Record<string, string | string[] | undefined>

export function parseUtmParams(searchParams: SearchParamsInput | undefined): UtmParams {
  if (!searchParams) return {}

  function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value
  }

  return {
    source: firstValue(searchParams.utm_source),
    medium: firstValue(searchParams.utm_medium),
    campaign: firstValue(searchParams.utm_campaign),
  }
}

/** Appends a short "(sumber: ...)" note to a WhatsApp message when any UTM param is present. Returns the message unchanged otherwise. */
export function appendUtmNote(message: string, utm: UtmParams): string {
  const parts = [utm.source, utm.medium, utm.campaign].filter((part): part is string => Boolean(part))
  if (parts.length === 0) return message
  return `${message}\n\n(sumber: ${parts.join('/')})`
}
