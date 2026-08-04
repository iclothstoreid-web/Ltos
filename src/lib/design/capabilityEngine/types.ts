// AI Capability Engine (Sprint AI-R3 "AI Capability Engine") — replaces the
// old binary PASS/FAIL Render Validator gate with a graduated 5-level
// capability grade. The render pipeline no longer only decides "boleh atau
// tidak render" — it decides which INPUTS a render can graceful use, and
// reports that grade instead of silently succeeding or hard-failing.

export type CapabilityMode = 'PREMIUM' | 'HIGH' | 'STANDARD' | 'LIMITED' | 'BLOCKED'

export const CAPABILITY_QUALITY_LEVEL: Record<CapabilityMode, number> = {
  PREMIUM: 5,
  HIGH: 4,
  STANDARD: 3,
  LIMITED: 2,
  BLOCKED: 1,
}

export const CAPABILITY_STARS: Record<CapabilityMode, string> = {
  PREMIUM: '★★★★★',
  HIGH: '★★★★☆',
  STANDARD: '★★★☆☆',
  LIMITED: '★★☆☆☆',
  BLOCKED: '☆☆☆☆☆',
}

// What the render is actually allowed to use, derived from `mode` — Prompt
// Architecture's Identity Lock (Layer 1, promptArchitectureV2/layers.ts) is
// a permanent template unrelated to capability grading, so it stays `true`
// whenever a render is attempted at all (every mode except BLOCKED); this
// sprint's brief never asks to weaken identity protection at lower quality
// tiers, only to stop hard-failing on a missing reference/partial DNA.
//
// `includeModelReference` renamed to `includeBaseHero` (Architecture Lock,
// 2026-08-04) — Model Thobe no longer contributes a reference image; the
// render-quality-anchoring role is now GLOBAL_BASE_HERO_IMAGE_URL
// (renderEngine/baseHero.ts), a Render Engine singleton.
export interface RenderStrategy {
  includeCustomerPhoto: boolean
  includeBaseHero: boolean
  includeDna: boolean
  includeIdentityLock: boolean
  sendToOpenAI: boolean
}

export interface CapabilityResult {
  mode: CapabilityMode
  capabilityScore: number
  qualityLevel: number
  warnings: string[]
  missingReferences: string[]
  missingDNA: string[]
  strategy: RenderStrategy
  /** Non-null only when mode === 'BLOCKED' — the one of 2 conditions that
   *  tripped it (Customer Photo missing / a selected component's DNA could
   *  not be resolved). Architecture Lock (2026-08-04) removed the old
   *  Model-Thobe-Anchor-specific conditions — Model Thobe no longer
   *  contributes DNA, so it can no longer block a render either; this is
   *  the ONLY thing allowed to stop a render before OpenAI. */
  blockedReason: string | null
}
