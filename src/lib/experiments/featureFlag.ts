import { getVariant } from './assignment'

// Sprint W9-1 §10 — thin feature-flag helper over the variant assignment
// system, for the common case of a simple on/off toggle rather than a
// full multi-variant experiment (e.g. "is the treatment variant of
// sticky_cta_visibility on for this visitor?").
export function isFeatureEnabled(experimentId: string, sessionId: string, enabledVariantId = 'treatment'): boolean {
  return getVariant(experimentId, sessionId) === enabledVariantId
}
