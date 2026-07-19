// ============================================================
// LTOS V1.0 — Type Definitions
// Single source of truth for all data shapes
// ============================================================

export type UserRole = 'owner' | 'admin' | 'artisan'

export type WorkflowState =
  | 'lead'
  | 'consultation'
  | 'appointment'
  | 'measurement'
  | 'quotation'
  | 'order'
  | 'assign'
  | 'production'
  | 'qc'
  | 'delivery'
  | 'follow_up'

export type QueueType =
  | 'consultation'
  | 'appointment'
  | 'measurement'
  | 'quotation'
  | 'assign'
  | 'production'
  | 'qc'
  | 'delivery'
  | 'follow_up'

export type QueueStatus = 'pending' | 'in_progress' | 'completed'
export type ProductionStepStatus = 'pending' | 'in_progress' | 'completed'
export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected'

export interface Profile {
  id: string
  name: string
  role: UserRole
  created_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  address: string | null
  created_at: string
  created_by: string
}

export interface Order {
  id: string
  customer_id: string
  order_number: string
  current_state: WorkflowState
  created_at: string
  updated_at: string
  // Public Customer Journey identity — separate from order_number/id, never
  // exposed to Production/Owner surfaces as an identifier.
  customer_token: string
  // Joined
  customers?: Customer
}

export interface Measurement {
  id: string
  order_id: string | null
  consultation_id: string | null
  chest: number | null
  shoulder: number | null
  sleeve: number | null
  length: number | null
  notes: string | null
  created_at: string
}

export interface ProductionStep {
  id: string
  order_id: string
  step_name: string
  status: ProductionStepStatus
  notes: string | null
  completed_at?: string | null
  created_at: string
}

export interface Quotation {
  id: string
  order_id: string
  amount: number
  status: QuotationStatus
  notes: string | null
  created_at: string
  approved_at: string | null
}

export interface BusinessEvent {
  id: string
  order_id: string | null
  consultation_id: string | null
  event_type: string
  event_data: Record<string, unknown>
  created_by: string | null
  created_at: string
  // Joined
  profiles?: Profile
}

export interface QueueAssignment {
  id: string
  order_id: string
  queue_type: QueueType
  status: QueueStatus
  assigned_to: string | null
  created_at: string
  completed_at: string | null
  // Joined
  orders?: Order
}

// Owner OS task (for priority inbox)
export interface PriorityTask {
  id: string
  order_id: string
  order_number: string
  customer_name: string
  task_type: QueueType
  task_label: string
  context: string
  waiting_since: string
  urgency: 'critical' | 'high' | 'normal' | 'ready'
  workspace_url: string
}

// Decision options (the core of every workspace)
export interface DecisionOption {
  id: string
  label: string
  description: string
  event_type: string
  next_state: WorkflowState | null
  style: 'primary' | 'secondary' | 'danger'
}
