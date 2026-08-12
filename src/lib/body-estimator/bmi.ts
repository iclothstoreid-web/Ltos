import type { BmiCategory } from './types'

// Standard BMI formula, rounded to 1 decimal place for display.
export function calculateBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  return Math.round(bmi * 10) / 10
}

// Standard WHO adult BMI bands.
export function categorizeBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}
