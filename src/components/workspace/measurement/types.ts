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
  // Cutting Model / Finishing Pergelangan sprint: not body measurements
  // themselves, but they ride inside this same object so they flow through
  // the existing zero-schema-change pipeline (notesCodec -> consultations
  // snapshot -> order.created business_events -> get_production_packet's
  // locked_measurements) without touching that RPC. Optional so every
  // existing `{} as MeasurementFields` / EMPTY_FIELDS construction stays valid.
  cuttingModel?: CuttingModel
  wristFinishing?: WristFinishing
}

export type CuttingModel = 'slim' | 'semi_slim' | 'regular'
export type WristFinishing = 'manset' | 'sleting' | 'polos'

// The 12 canonical cm measurement keys, excluding the two categorical
// selections above — used by every Record<..., X> that must cover exactly
// those 12 fields (labels, body-map, delta tables), since `keyof
// MeasurementFields` now also includes cuttingModel/wristFinishing.
export type MeasurementKey = Exclude<keyof MeasurementFields, 'cuttingModel' | 'wristFinishing'>

export const CUTTING_MODEL_LABELS: Record<CuttingModel, string> = {
  slim: 'Slim Fit',
  semi_slim: 'Semi Slim Fit',
  regular: 'Regular',
}

export const WRIST_FINISHING_LABELS: Record<WristFinishing, string> = {
  manset: 'Manset',
  sleting: 'Sleting',
  polos: 'Polos',
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
export const FIELD_BODY_PARTS: Record<MeasurementKey, BodyPart[]> = {
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

// Short display names for the highlight overlay label — a separate,
// intentionally terser set than MeasurementSidebar's own field labels
// (e.g. "Shoulder Width"), since the overlay label sits next to the body
// part itself and doesn't need the sidebar's fuller wording.
export const FIELD_LABELS: Record<MeasurementKey, string> = {
  neck: 'Leher',
  shoulder: 'Bahu',
  chest: 'Dada',
  waist: 'Pinggang',
  hip: 'Pinggul',
  armhole: 'Kerung Lengan',
  sleeve: 'Lengan',
  biceps: 'Lengan Atas',
  elbow: 'Siku',
  wrist: 'Pergelangan Tangan',
  length: 'Panjang',
  hemWidth: 'Lebar Bawah',
}

export const BODY_TAGS = [
  'Atletis',
  'Bahu Lurus',
  'Bahu Membulat',
  'Leher Maju',
  'Perut Besar',
  'Ramping',
  'Badan Membungkuk',
] as const

export type BodyTag = (typeof BODY_TAGS)[number]
