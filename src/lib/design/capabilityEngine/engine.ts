import { CAPABILITY_QUALITY_LEVEL, type CapabilityMode, type CapabilityResult, type RenderStrategy } from './types'

// AI Capability Engine (Sprint AI-R3) — the ONE place that decides render
// mode/quality/strategy. Reads signals already computed elsewhere in the
// pipeline (DNA Validator results, Reference Composer's availability check)
// — it never re-derives them, never talks to Supabase/OpenAI itself, and
// never invents a new business rule; it only grades what upstream stages
// already found.
//
// Level ladder (brief's Phase 2), in the order this function checks them:
//   BLOCKED  — Customer Photo missing, OR Model Thobe not selected, OR the
//              Anchor's (Model Thobe) own AI Design DNA is empty/invalid.
//              These 3 are the ONLY conditions allowed to stop a render —
//              see Phase 4's "Remove Hard 422."
//   PREMIUM  — Anchor DNA valid, every other selected component's DNA also
//              valid, AND a Model Reference image is available.
//   HIGH     — same as PREMIUM but no Model Reference image (Model Thobe's
//              ai_dna.metadata.sourceImage is empty — DNA itself is fine,
//              just no reference photo).
//   STANDARD — Anchor DNA valid, but 50%+ of other selected components'
//              DNA is incomplete.
//   LIMITED  — Anchor DNA valid, but under 50% of other selected
//              components' DNA is complete ("DNA sebagian").
//
// capabilityScore is a presentation number layered on top of `mode` (which
// is the actual decision) — not the other way around. Weights: 20 base (for
// clearing BLOCKED) + up to 50 for secondary-component DNA completeness +
// 20 for Model Reference + 10 for Identity Lock (always present once not
// blocked, since Layer 1 is a fixed template — see types.ts).

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
  /** Was a model_thobe row actually selected+found for this request — NOT
   *  whether its DNA is usable (that's `modelThobeDnaValid`, checked next). */
  modelThobeSelected: boolean
  /** DNA Validator (promptArchitectureV2/dnaValidator.ts) result for the
   *  Anchor (model_thobe) component specifically. */
  modelThobeDnaValid: boolean
  /** Reference Composer's validateModelReferenceAvailable() result. */
  modelReferenceAvailable: boolean
  /** DNA Validator results for every OTHER selected+resolved component
   *  (never includes model_thobe — that's graded separately above). */
  otherComponentDnaResults: OtherComponentDnaResult[]
  /** Sprint PR-01 (P3/P8, Fail Fast) — every component the customer actually
   *  SELECTED (not the design-level "(None)" sentinel — those never reach
   *  this input at all) that `resolveDNA` could not resolve (item not
   *  found, AI Design DNA still `pending`, or Render Recipe still `empty`).
   *  Any entry here now BLOCKS the render instead of silently continuing
   *  without that component — the brief's own example is Model Thobe
   *  resolving to a generic garment with no trace of what was actually
   *  picked; the fix is to never let that happen quietly for ANY selected
   *  component, not only the Anchor. */
  unresolvedComponents: UnresolvedComponent[]
}

const BLOCKED_STRATEGY: RenderStrategy = {
  includeCustomerPhoto: false,
  includeModelReference: false,
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
  if (!input.modelThobeSelected) {
    return blocked('Model Thobe tidak dipilih.')
  }
  if (!input.modelThobeDnaValid) {
    return blocked('AI Design DNA utama (Model Thobe) kosong/tidak valid.', ['model_thobe (Anchor)'])
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
  const missingDNA = input.otherComponentDnaResults.filter((r) => !r.valid).map((r) => `${r.category} (${r.itemId})`)

  if (!input.modelReferenceAvailable) {
    missingReferences.push('MODEL_THOBE')
    warnings.push('Model Reference belum tersedia — render tetap dilakukan dengan DNA saja.')
  }

  const otherTotal = input.otherComponentDnaResults.length
  const otherPassed = otherTotal - missingDNA.length
  const dnaPassRatio = otherTotal === 0 ? 1 : otherPassed / otherTotal
  if (dnaPassRatio < 1 && otherTotal > 0) {
    warnings.push(`Sebagian Component DNA belum lengkap: ${missingDNA.join(', ')}.`)
  }

  let mode: CapabilityMode
  if (dnaPassRatio === 1 && input.modelReferenceAvailable) mode = 'PREMIUM'
  else if (dnaPassRatio === 1) mode = 'HIGH'
  else if (dnaPassRatio >= 0.5) mode = 'STANDARD'
  else mode = 'LIMITED'

  if (mode === 'LIMITED') warnings.push('Kualitas render terbatas — sebagian besar Component DNA belum lengkap.')

  const capabilityScore = Math.round(20 + dnaPassRatio * 50 + (input.modelReferenceAvailable ? 20 : 0) + 10)

  const strategy: RenderStrategy = {
    includeCustomerPhoto: true,
    includeModelReference: input.modelReferenceAvailable,
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
