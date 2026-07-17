export type BodyPart =
  | 'head'
  | 'neck'
  | 'shoulders'
  | 'chest'
  | 'waist'
  | 'hip'
  | 'leftArm'
  | 'rightArm'
  | 'leftSleeve'
  | 'rightSleeve'
  | 'legs'

// The 12 required measurement fields. Only chest/shoulder/sleeve/length map
// to real columns on the `measurements` table (order_id/consultation_id,
// chest, shoulder, sleeve, length, notes). The other 8 have no DB column —
// per the brief ("if database persistence is incomplete, keep the UI
// complete", "do not modify database unless absolutely required") they're
// captured in the UI and persisted by appending a structured block to the
// existing free-text `notes` column rather than adding new columns.
export interface MeasurementFields {
  neck: string
  shoulder: string
  chest: string
  waist: string
  hip: string
  armhole: string
  sleeve: string
  biceps: string
  elbow: string
  wrist: string
  length: string // "Thobe Length" / garment full length
  hemWidth: string
}

export const EMPTY_FIELDS: MeasurementFields = {
  neck: '',
  shoulder: '',
  chest: '',
  waist: '',
  hip: '',
  armhole: '',
  sleeve: '',
  biceps: '',
  elbow: '',
  wrist: '',
  length: '',
  hemWidth: '',
}

// Which mannequin part(s) glow when a given measurement field is focused.
export const FIELD_BODY_PARTS: Record<keyof MeasurementFields, BodyPart[]> = {
  neck: ['neck'],
  shoulder: ['shoulders'],
  chest: ['chest'],
  waist: ['waist'],
  hip: ['hip'],
  armhole: ['shoulders', 'chest'],
  sleeve: ['leftArm', 'rightArm', 'leftSleeve', 'rightSleeve'],
  biceps: ['leftArm', 'rightArm'],
  elbow: ['leftSleeve', 'rightSleeve'],
  wrist: ['leftSleeve', 'rightSleeve'],
  length: ['legs'],
  hemWidth: ['legs'],
}

export const BODY_TAGS = [
  'Athletic',
  'Straight Shoulder',
  'Round Shoulder',
  'Forward Neck',
  'Large Belly',
  'Slim',
  'Stooped',
] as const

export type BodyTag = (typeof BODY_TAGS)[number]
