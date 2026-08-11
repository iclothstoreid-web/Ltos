import 'server-only'

// W2-5 environment/security check — deliberately a standalone module rather
// than an edit to session.ts (locked, "save/share system"): session.ts
// already warns at import time if CONFIGURATOR_SESSION_SECRET is missing in
// production (see its own module-scope check, added W2-4). This file adds
// a stronger, explicit *validation* on top — minimum-length check for
// whatever secret IS set — usable by a future health-check route or ops
// script without touching the signing logic itself. Never logs the secret
// value.
const MIN_SECRET_LENGTH = 16

export type SessionSecretStatus =
  | { ok: true; source: 'env' }
  | { ok: false; source: 'fallback'; reason: string }
  | { ok: false; source: 'env'; reason: string }

export function getSessionSecretStatus(): SessionSecretStatus {
  const secret = process.env.CONFIGURATOR_SESSION_SECRET

  if (!secret) {
    return {
      ok: false,
      source: 'fallback',
      reason: 'CONFIGURATOR_SESSION_SECRET is not set — session.ts is using its dev-only fallback. Anyone could forge shareable design links.',
    }
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    return {
      ok: false,
      source: 'env',
      reason: `CONFIGURATOR_SESSION_SECRET is set but shorter than ${MIN_SECRET_LENGTH} characters — too weak for HMAC-SHA256 signing.`,
    }
  }

  return { ok: true, source: 'env' }
}

export function assertProductionReady(): void {
  if (process.env.NODE_ENV !== 'production') return
  const status = getSessionSecretStatus()
  if (!status.ok) {
    // eslint-disable-next-line no-console
    console.error(`[configurator/runtimeGuards] ${status.reason}`)
  }
}
