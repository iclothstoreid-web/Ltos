// Sprint W0.2 — Rule-Based Estimation Engine. Pure types, no UI, no I/O.
// This engine is the W0 marketing/acquisition layer only — its output is
// never a production measurement and never touches LTOS W4 (the fitter-
// verified Digital Body Profile, which remains the single source of truth
// for production).

export type BodyProfileType = 'slim' | 'athletic' | 'straight' | 'broad-shoulder' | 'full-body' | 'tall-lean'

export type FitType = 'slim' | 'regular' | 'relaxed'

export type ThobeSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese'

export interface EstimatorInput {
  height: number // cm
  weight: number // kg
  age: number // years
}

export interface EstimatorResult {
  bmi: number
  bmiCategory: BmiCategory
  bodyProfile: BodyProfileType
  fit: FitType
  size: ThobeSize
  confidence: number
  explanation: string
}

// Sprint W0.4 §"Booking Draft" — held in memory/local component state only
// (no database this sprint). Shape is deliberately final now so W0.5 / a
// future LTOS Check-In integration can consume it without a schema change.
export interface BookingDraft {
  name: string
  whatsapp: string
  email: string
  height: number
  weight: number
  age: number
  bodyProfile: BodyProfileType
  fit: FitType
  size: ThobeSize
  confidence: number
  createdAt: string // ISO timestamp
}
