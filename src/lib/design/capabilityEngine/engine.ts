import { CAPABILITY_QUALITY_LEVEL, type CapabilityMode, type CapabilityResult, type RenderStrategy } from './types'

// AI Capability Engine (Sprint AI-R3) — the ONE place that decides render
// mode/quality/strategy. Reads signals already computed elsewhere in the
// pipeline (DNA Validator results, AI Asset Composer's availability check)
// — it never re-derives them, never talks to Supabase/OpenAI itself, and
// never invents a new business rule; it only grades what upstream stages
// already found.
//
// Architecture Lock (2026-08-04) — Model Thobe was the Anchor this ladder
// used to be built around: its own DNA validity/selection used to be 2 of
// only 3 allowed BLOCKED conditions, and its Model Reference image decided
// PREMIUM vs. HIGH. Model Thobe no longer contributes DNA or a reference to
// Prompt Assembly at all (catalog-only now), so both of those Anchor-
// specific conditions are REMOVED per explicit decision — this gate no
// longer blocks on Model Thobe in any way. Base Hero Model
// (GLOBAL_BASE_HERO_IMAGE_URL, renderEngine/baseHero.ts) takes over only
// the PREMIUM/HIGH quality-grading role Model Reference used to play — it
// does NOT become a new BLOCKED condition; a missing Base Hero degrades
// quality, it never stops a render.
//
// Level ladder, in the order this function checks them:
//   BLOCKED  — Customer Photo missing, OR a selected component could not
//              be resolved (unresolvedComponents). These are the ONLY
//              conditions allowed to stop a render.
//   PREMIUM  — every selected component's DNA valid AND Base Hero Model is
//              configured.
//   HIGH     — same as PREMIUM but Base Hero Model is not configured
//              (GLOBAL_BASE_HERO_IMAGE_URL is null).
//   STANDARD — 50%+ of selected components' DNA is incomplete.
//   LIMITED  — under 50% of selected components' DNA is complete.
//
// capabilityScore is a presentation number layered on top of `mode` (which
// is the actual decision) — not the other way around. Weights: 20 base (for
// clearing BLOCKED) + up to 50 for component DNA completeness + 20 for Base
// Hero Model + 10 for Identity Lock (always present once not blocked, since
// Layer 1 is a fixed template — see types.ts).

export interface OtherComponentDnaResult {
  itemId: string
  category: string
  valid: boolean
}

export interface UnresolvedComponent {
  itemId: string
  category: string
  reason: string
}

export interface EvaluateCapabilityInput {
  customerPhotoPresent: boolean
  /** Is the Global Base Hero Model (renderEngine/baseHero.ts,
   *  GLOBAL_BASE_HERO_IMAGE_URL !== null) configured for this render — a
   *  Render Engine singleton, not per-order, so this is the same value on
   *  every request until an owner sets the constant. Never blocks a
   *  render; only decides PREMIUM vs. HIGH. */
  baseHeroAvailable: boolean
  /** DNA Validator results for every selected+resolved component (Model
   *  Thobe is never included — it's excluded from DNA resolution entirely
   *  now, see route.ts). */
  componentDnaResults: OtherComponentDnaResult[]
  /** Sprint PR-01 (P3/P8, Fail Fast) — every component the customer actually
   *  SELECTED (not the design-level "(None)" sentinel — those never reach
   *  this input at all, and Model Thobe never reaches it either now) that
   *  `resolveDNA` could not resolve (item not found, AI Design DNA still
   *  `pending`, or Render Recipe still `empty`). Any entry here BLOCKS the
   *  render instead of silently continuing without that component. */
  unresolvedComponents: UnresolvedComponent[]
}

const BLOCKED_STRATEGY: RenderStrategy = {
  includeCustomerPhoto: false,
  includeBaseHero: false,
  includeDna: false,
  includeIdentityLock: false,
  sendToOpenAI: false,
}

function blocked(reason: string, missingDNA: string[] = []): CapabilityResult {
  return {
    mode: 'BLOCKED',
    capabilityScore: 0,
    qualityLevel: CAPABILITY_QUALITY_LEVEL.BLOCKED,
    warnings: [],
    missingReferences: [],
    missingDNA,
    strategy: BLOCKED_STRATEGY,
    blockedReason: reason,
  }
}

export function evaluateCapability(input: EvaluateCapabilityInput): CapabilityResult {
  if (!input.customerPhotoPresent) {
    return blocked('Customer Photo tidak ada.')
  }
  if (input.unresolvedComponents.length > 0) {
    const reasonList = input.unresolvedComponents.map((c) => `${c.category} (${c.itemId}): ${c.reason}`)
    return blocked(
      `Komponen yang dipilih belum bisa dirender: ${reasonList.join(' | ')}`,
      input.unresolvedComponents.map((c) => `${c.category} (${c.itemId})`)
    )
  }

  const warnings: string[] = []
  const missingReferences: string[] = []
  const missingDNA = input.componentDnaResults.filter((r) => !r.valid).map((r) => `${r.category} (${r.itemId})`)

  if (!input.baseHeroAvailable) {
    missingReferences.push('BASE_HERO')
    warnings.push('Base Hero Model belum dikonfigurasi — render tetap dilakukan dengan DNA saja.')
  }

  const componentTotal = input.componentDnaResults.length
  const componentPassed = componentTotal - missingDNA.length
  const dnaPassRatio = componentTotal === 0 ? 1 : componentPassed / componentTotal
  if (dnaPassRatio < 1 && componentTotal > 0) {
    warnings.push(`Sebagian Component DNA belum lengkap: ${missingDNA.join(', ')}.`)
  }

  let mode: CapabilityMode
  if (dnaPassRatio === 1 && input.baseHeroAvailable) mode = 'PREMIUM'
  else if (dnaPassRatio === 1) mode = 'HIGH'
  else if (dnaPassRatio >= 0.5) mode = 'STANDARD'
  else mode = 'LIMITED'

  if (mode === 'LIMITED') warnings.push('Kualitas render terbatas — sebagian besar Component DNA belum lengkap.')

  const capabilityScore = Math.round(20 + dnaPassRatio * 50 + (input.baseHeroAvailable ? 20 : 0) + 10)

  const strategy: RenderStrategy = {
    includeCustomerPhoto: true,
    includeBaseHero: input.baseHeroAvailable,
    includeDna: true,
    includeIdentityLock: true,
    sendToOpenAI: true,
  }

  return {
    mode,
    capabilityScore,
    qualityLevel: CAPABILITY_QUALITY_LEVEL[mode],
    warnings,
    missingReferences,
    missingDNA,
    strategy,
    blockedReason: null,
  }
}
