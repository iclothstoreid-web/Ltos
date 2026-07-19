// Per your decision: payload only, no rendered QR image. No QR-encoding
// library exists in this repo, and hand-rolling QR encoding (Reed-Solomon
// error correction, module placement) risks producing something that looks
// like a QR code but doesn't actually scan — worse than not rendering one.
//
// This is the canonical string that a real QR image would encode later.
// Order ID only, never Customer ID, per the brief. Usable as-is by
// Production QR App / Customer QR Portal / Owner OS once they exist — they
// just need to resolve this URL/id, not a specific image format.
export function buildQrPayload(orderId: string): string {
  return `https://track.ltos.id/o/${orderId}`
}

// Separate QR for the shop floor's internal Production Packet — distinct
// from the customer-facing tracking QR above, since a customer must never
// land on the internal workflow page. Same "payload only" reasoning: this
// is the URL a printed sticker would encode, opened by scanning with a
// phone camera, not rendered/scanned in-app.
const PRODUCTION_QR_PREFIX = 'https://ops.ltos.id/workspace/production/'

export function buildProductionQrPayload(orderId: string): string {
  return `${PRODUCTION_QR_PREFIX}${orderId}`
}

// Inverse of buildProductionQrPayload — used by the Production app's Scan QR
// entry point to recover the order id from whatever Fitter's printed QR
// decodes to, without minting any new QR format.
export function parseProductionQrPayload(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed.startsWith(PRODUCTION_QR_PREFIX)) return null
  const orderId = trimmed.slice(PRODUCTION_QR_PREFIX.length)
  return orderId.length > 0 ? orderId : null
}

// Customer Journey's public identity — deliberately separate from the
// Production QR above. A customer_token must never resolve inside
// /workspace/production, and a production order id must never resolve
// inside /journey. Generated once at Create Order time (orders.customer_token
// is NOT NULL + UNIQUE) and never regenerated afterward.
export function generateCustomerToken(): string {
  return globalThis.crypto.randomUUID().replace(/-/g, '')
}

const CUSTOMER_JOURNEY_PREFIX = 'https://ltos.id/journey/'

export function buildCustomerJourneyUrl(customerToken: string): string {
  return `${CUSTOMER_JOURNEY_PREFIX}${customerToken}`
}
