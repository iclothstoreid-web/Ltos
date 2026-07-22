// The 6 couriers required by the Shipping Experience sprint, each with its
// verified official tracking page. None of these carriers expose a
// documented query-parameter that pre-fills the resi on their official
// site (confirmed by research before writing this) — "Lacak Pengiriman"
// therefore opens the courier's own official tracking page, where the
// customer pastes the resi already shown on this page, rather than
// guessing at an unofficial deep-link format that could silently break.
export interface CourierOption {
  value: string
  label: string
  trackingUrl: string
}

export const COURIERS: CourierOption[] = [
  { value: 'jne', label: 'JNE', trackingUrl: 'https://www.jne.co.id/tracking-package' },
  { value: 'jnt', label: 'J&T Express', trackingUrl: 'https://www.jet.co.id/track' },
  { value: 'sicepat', label: 'SiCepat', trackingUrl: 'https://www.sicepat.com/checkAwb' },
  { value: 'anteraja', label: 'AnterAja', trackingUrl: 'https://anteraja.id/tracking' },
  { value: 'ninja', label: 'Ninja Xpress', trackingUrl: 'https://www.ninjaxpress.co/id-id/tracking' },
  { value: 'pos', label: 'POS Indonesia', trackingUrl: 'https://www.posindonesia.co.id/id/tracking' },
]

export function courierLabel(value: string | null): string | null {
  if (!value) return null
  return COURIERS.find(c => c.value === value)?.label ?? value
}

export function courierTrackingUrl(value: string | null): string | null {
  if (!value) return null
  return COURIERS.find(c => c.value === value)?.trackingUrl ?? null
}
