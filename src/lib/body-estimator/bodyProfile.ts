import type { BmiCategory, BodyProfileType, FitType } from './types'

// Thresholds chosen to keep the rules readable and easy to re-tune later —
// no external data, per brief ("Jangan menggunakan data eksternal").
const TALL_HEIGHT_THRESHOLD_CM = 178
const ATHLETIC_HEIGHT_RANGE_CM: readonly [number, number] = [165, 182]

// Body Profile Rules (brief §"Body Profile Rules"):
// underweight + tall            -> tall-lean
// underweight                   -> slim
// normal + medium height        -> athletic
// normal                        -> straight
// overweight                    -> broad-shoulder
// obese                         -> full-body
export function determineBodyProfile(bmiCategory: BmiCategory, heightCm: number): BodyProfileType {
  if (bmiCategory === 'underweight') {
    return heightCm >= TALL_HEIGHT_THRESHOLD_CM ? 'tall-lean' : 'slim'
  }

  if (bmiCategory === 'normal') {
    const [min, max] = ATHLETIC_HEIGHT_RANGE_CM
    return heightCm >= min && heightCm <= max ? 'athletic' : 'straight'
  }

  if (bmiCategory === 'overweight') {
    return 'broad-shoulder'
  }

  return 'full-body' // obese
}

// Fit Recommendation (brief §"Fit Recommendation"): body profile -> fit.
const FIT_BY_PROFILE: Record<BodyProfileType, FitType> = {
  slim: 'slim',
  athletic: 'regular',
  straight: 'regular',
  'broad-shoulder': 'regular',
  'full-body': 'relaxed',
  'tall-lean': 'regular',
}

export function recommendFit(profile: BodyProfileType): FitType {
  return FIT_BY_PROFILE[profile]
}
