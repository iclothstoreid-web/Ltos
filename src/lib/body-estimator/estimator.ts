import type { EstimatorInput, EstimatorResult } from './types'
import { calculateBmi, categorizeBmi } from './bmi'
import { determineBodyProfile, recommendFit } from './bodyProfile'
import { recommendSize } from './sizeRecommendation'
import { calculateConfidence } from './confidence'
import { generateExplanation } from './explanation'

// Main Estimator (brief §"Main Estimator") — the only entry point UI code
// should call. Pure and deterministic: same input always produces the same
// output, no AI, no ML, no database, no network. Rule-based only, per
// Sprint W0.2 scope.
export function estimateBodyProfile({ height, weight, age }: EstimatorInput): EstimatorResult {
  const bmi = calculateBmi(height, weight)
  const bmiCategory = categorizeBmi(bmi)
  const bodyProfile = determineBodyProfile(bmiCategory, height)
  const fit = recommendFit(bodyProfile)
  const size = recommendSize(height, weight)
  const confidence = calculateConfidence(bmiCategory, height, weight, age)
  const explanation = generateExplanation(bodyProfile, fit)

  return { bmi, bmiCategory, bodyProfile, fit, size, confidence, explanation }
}
