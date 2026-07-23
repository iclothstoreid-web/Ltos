import type {
  CuttingModel,
  MeasurementFields,
  MeasurementKey,
  WristFinishing,
} from '@/components/workspace/measurement/types'

// Locked per the master prompt: Cutting Model never changes the fitter's
// original measurement (that stays read-only/locked) — it only changes the
// Pattern Formulation's starting point on the Production side. Keys here are
// the same MeasurementFields keys the rest of the app already uses.
const CUTTING_MODEL_DELTA: Record<CuttingModel, Record<MeasurementKey, number>> = {
  slim: {
    neck: 1.5, shoulder: 0, chest: 6, waist: 6, armhole: 4, sleeve: 0,
    biceps: 3, elbow: 3, wrist: 0, hip: 6, hemWidth: 0, length: 0,
  },
  semi_slim: {
    neck: 2, shoulder: 0, chest: 8, waist: 8, armhole: 6, sleeve: 0,
    biceps: 5, elbow: 5, wrist: 0, hip: 8, hemWidth: 0, length: 0,
  },
  regular: {
    neck: 2.5, shoulder: 2, chest: 12, waist: 12, armhole: 8, sleeve: 0,
    biceps: 7, elbow: 7, wrist: 0, hip: 12, hemWidth: 0, length: 0,
  },
}

// Applies only to `wrist` (Lingkar Pergelangan), on top of the Cutting Model
// delta above (which is always +0 for wrist).
const WRIST_FINISHING_DELTA: Record<WristFinishing, number> = {
  manset: 6,
  sleting: 6,
  polos: 8,
}

const MEASUREMENT_KEYS: MeasurementKey[] = [
  'neck', 'shoulder', 'chest', 'waist', 'hip', 'armhole',
  'sleeve', 'biceps', 'elbow', 'wrist', 'length', 'hemWidth',
]

function addDelta(value: string, delta: number): string {
  const parsed = parseFloat(value)
  if (!value || Number.isNaN(parsed)) return value
  const result = parsed + delta
  // Drop a trailing ".0" (106 + 6 => "112", not "112.0") while still
  // preserving genuine decimals (e.g. 106.5 + 6 => "112.5").
  return Number.isInteger(result) ? String(result) : String(Math.round(result * 100) / 100)
}

// The auto-fill formula for Production's Pattern Formulation panel:
// locked measurement + Cutting Model rule + Finishing Pergelangan rule.
// Only computed once, as the starting point when a formulation is first
// opened — the operator can freely edit afterward (see PatternFormulationPanel).
export function computePatternFormulation(locked: MeasurementFields): MeasurementFields {
  const { cuttingModel, wristFinishing } = locked
  const result = { ...locked }

  for (const key of MEASUREMENT_KEYS) {
    let value = locked[key] ?? ''
    if (cuttingModel) {
      value = addDelta(value, CUTTING_MODEL_DELTA[cuttingModel][key])
    }
    if (key === 'wrist' && wristFinishing) {
      value = addDelta(value, WRIST_FINISHING_DELTA[wristFinishing])
    }
    result[key] = value
  }

  return result
}
