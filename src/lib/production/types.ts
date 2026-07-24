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
  // `divisi` is a read-only mirror of master_divisions.name, kept in sync by
  // DB triggers off `division_id` (see 20260810000000_add_operator_division_id.sql)
  // -- safe to display, never write directly. `division_id` is the real FK
  // and the only thing that should ever be sent back to a write RPC.
  divisi: string | null
  division_id: string | null
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
  decision: 'approved' | 'alter' | 'skipped' | null
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
  // Delivery hotfix -- 'follow_up' is the only value meaning the order has
  // actually been marked Delivered (see resolveDeliveryState in
  // src/lib/journey/milestone.ts). Everything else (lead/order/production/
  // etc.) reads as "not yet delivered" for this purpose.
  current_state: string
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

// Production Rules — Runtime Configuration read live by complete_stage and
// the kiosk workspace itself. See
// supabase/migrations/20260811000000_add_business_rules_runtime_config.sql
// and 20260812000000_replace_skip_stage_with_emergency_override.sql. The
// locked 8-stage order (ProductionStage above) never changes — these only
// tune what's required/allowed at each step. There is deliberately no
// "skip stage" toggle here: that would grant a standing, workflow-wide
// capability rather than tune a parameter — see Emergency Override
// (emergencyOverrideStage in lib/production/client.ts) for the per-order,
// per-stage, always-audited replacement.
export interface ProductionRules {
  qr_required: boolean
  qc_checklist_required: boolean
  max_alter_attempts: number
  alter_return_stage: ProductionStage
  delivery_confirmation_required: boolean
  auto_close_after_delivered: boolean
  updated_at: string
  updated_by: string | null
}

// One row of production_stage_override_audit_log — the append-only trail
// for Emergency Override. Order-scoped by design (order_id), never global.
export interface ProductionStageOverrideAuditLogEntry {
  id: string
  order_id: string
  stage_record_id: string
  stage: ProductionStage
  reason: string
  overridden_by: string | null
  overridden_at: string
}
