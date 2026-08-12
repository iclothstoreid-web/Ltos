import type { BmiCategory } from './types'

const MIN_CONFIDENCE = 55
const MAX_CONFIDENCE = 85

// Confidence Score (brief §"Confidence Score") — BMI normal scores
// highest; each extreme raw input (near the W0.1 form's own validation
// edges: height 140-210, weight 35-180, age 15-80) shaves points off,
// since the rule-based model is calibrated on typical adult bodies.
export function calculateConfidence(bmiCategory: BmiCategory, heightCm: number, weightKg: number, age: number): number {
  let score: number
  if (bmiCategory === 'normal') {
    score = 85
  } else if (bmiCategory === 'overweight' || bmiCategory === 'underweight') {
    score = 72
  } else {
    score = 60 // obese
  }

  const nearHeightEdge = heightCm <= 150 || heightCm >= 200
  const nearWeightEdge = weightKg <= 40 || weightKg >= 160
  const nearAgeEdge = age <= 17 || age >= 70
  const extremeEdgeCount = [nearHeightEdge, nearWeightEdge, nearAgeEdge].filter(Boolean).length

  score -= extremeEdgeCount * 5

  return Math.max(MIN_CONFIDENCE, Math.min(MAX_CONFIDENCE, Math.round(score)))
}
