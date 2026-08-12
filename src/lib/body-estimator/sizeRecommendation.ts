import type { ThobeSize } from './types'

const SIZE_ORDER: readonly ThobeSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Weight is the primary driver of a thobe's girth; this is the base band.
function baseSizeFromWeight(weightKg: number): ThobeSize {
  if (weightKg < 50) return 'XS'
  if (weightKg < 60) return 'S'
  if (weightKg < 75) return 'M'
  if (weightKg < 90) return 'L'
  if (weightKg < 105) return 'XL'
  return 'XXL'
}

// Height nudges the base size by one step — a very tall or very short
// frame needs more or less length/room than weight alone implies.
function heightAdjustment(heightCm: number): -1 | 0 | 1 {
  if (heightCm >= 185) return 1
  if (heightCm <= 158) return -1
  return 0
}

// Size Recommendation (brief §"Size Recommendation") — an initial estimate
// only, never a production measurement.
export function recommendSize(heightCm: number, weightKg: number): ThobeSize {
  const baseIndex = SIZE_ORDER.indexOf(baseSizeFromWeight(weightKg))
  const adjustedIndex = baseIndex + heightAdjustment(heightCm)
  const clampedIndex = Math.min(SIZE_ORDER.length - 1, Math.max(0, adjustedIndex))
  return SIZE_ORDER[clampedIndex]
}

const CHEST_RANGE_CM: Record<ThobeSize, string> = {
  XS: '86–91 cm',
  S: '91–96 cm',
  M: '96–102 cm',
  L: '102–109 cm',
  XL: '109–117 cm',
  XXL: '117–127 cm',
}

const SHOULDER_RANGE_CM: Record<ThobeSize, string> = {
  XS: '41–42 cm',
  S: '42–43.5 cm',
  M: '43.5–45 cm',
  L: '45–46.5 cm',
  XL: '46.5–48 cm',
  XXL: '48–50 cm',
}

// Sprint W0.3 §EstimatedSizeCard — presentational chest/shoulder ranges for
// a given size, for display next to the size letter. Same "initial estimate
// only" caveat as recommendSize() above.
export function getSizeRangeLabels(size: ThobeSize): { chestRange: string; shoulderRange: string } {
  return { chestRange: CHEST_RANGE_CM[size], shoulderRange: SHOULDER_RANGE_CM[size] }
}
