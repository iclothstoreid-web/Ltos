import type { MeasurementFields } from '@/components/workspace/measurement/types'
import type { DesignSelections } from '@/components/workspace/design-studio/types'

// The 8 LOCKED internal production stages, in order. Never reorder — the
// workflow sequence itself is locked by the master prompt.
export type ProductionStage =
  | 'material_prep'
  | 'pattern_formulation'
  | 'cutting'
  | 'sewing'
  | 'qc'
  | 'finishing'
  | 'packing'
  | 'shipping'

export type StageStatus = 'pending' | 'in_progress' | 'completed'

export type PatternTemplate = 'slim_fit' | 'standar' | 'regular' | 'custom'

export type OperatorStatus = 'aktif' | 'libur' | 'cuti' | 'nonaktif'

export interface Operator {
  id: string
  nama: string
  is_active: boolean
  divisi: string | null
  status: OperatorStatus
  deleted_at: string | null
  max_concurrent_capacity: number
  created_at: string
  updated_at: string
}

// One row per attempt of a stage — append-only, so a QC "Alter" decision can
// send Penjahitan back for a second attempt without erasing the first.
export interface StageRecord {
  id: string
  order_id: string
  stage: ProductionStage
  attempt: number
  status: StageStatus
  operator_id: string | null
  operator_name: string | null
  division: string | null
  started_at: string | null
  completed_at: string | null
  checklist: Record<string, boolean> | null
  evidence_url: string | null
  video_url: string | null
  courier: string | null
  tracking_number: string | null
  decision: 'approved' | 'alter' | null
  alter_category: string | null
  notes: string | null
  // Set by assign_stage_operator (Owner's "Tugaskan" flow) — distinct from
  // operator_id/started_at above, which start_stage sets once the operator
  // actually begins work. A stage can be assigned before anyone has started it.
  assigned_operator_id: string | null
  assigned_operator_name: string | null
  assigned_at: string | null
  created_at: string
  updated_at: string
}

// One row of list_pending_assignments() — the kiosk-wide "Pekerjaan Baru
// Ditugaskan" list shown on the /production scan-entry landing page.
export interface PendingAssignment {
  notification_id: string
  order_id: string
  order_number: string
  customer_name: string | null
  stage: ProductionStage
  stage_record_id: string
  assigned_operator_name: string | null
  created_at: string
}

export interface PatternFormulation {
  id: string
  order_id: string
  template: PatternTemplate
  pattern_measurements: MeasurementFields
  operator_id: string | null
  created_at: string
  updated_at: string
}

// The full shape returned by the `get_production_packet` RPC — the single
// read the kiosk page needs. Never a raw table row; assembled server-side so
// the anon key never touches orders/customers/business_events directly.
export interface ProductionPacket {
  order_id: string
  order_number: string
  created_at: string
  // Service Engine: null for pre-Sprint-C orders (no service selected yet),
  // in which case estimated_completion below falls back to created_at + 14
  // days instead of Hari D + SLA -- see get_production_packet.
  service_level: 'standard' | 'fast' | 'very_fast' | null
  hari_d: string | null
  estimated_completion: string
  // Queue Engine (Sprint D). queue_position/priority_level are null once the
  // order is 'completed' or 'hold' -- both are out of the active queue.
  // priority_level is the Priority Engine rank (1 Very Fast, 2 Fast, 3
  // Standard, 4 unset), not a raw service_level string.
  queue_status: 'waiting' | 'ready' | 'in_progress' | 'hold' | 'completed'
  priority_level: number | null
  queue_position: number | null
  customer_name: string | null
  design: DesignSelections | null
  locked_measurements: MeasurementFields | null
  consultation_notes: string | null
  stage_records: StageRecord[]
  pattern_formulation: PatternFormulation | null
  progress: number
}
