import type { BottleneckDashboard } from '@/lib/kpi/types'

// Owner OS "Decision Center" (Sprint I). Every shape here mirrors Sprint H's
// get_owner_summary()/get_sla_risk_orders() jsonb/table output 1:1 -- no
// client-side derivation of numbers that should come from the database (see
// supabase/migrations/20260803000000_add_production_intelligence.sql).

export type ServiceLevel = 'standard' | 'fast' | 'very_fast'
export type SlaRiskLevel = 'over_sla' | 'risk' | 'on_track'

// One row of get_sla_risk_orders() -- every non-completed order classified
// against its SLA window. Full list (not just the at-risk subset), so
// Section 1 can render all three buckets with a clickable row into Detail
// Order.
export interface SlaRiskOrder {
  order_id: string
  order_number: string
  service_level: ServiceLevel | null
  hari_d: string | null
  estimated_completion: string
  queue_status: 'waiting' | 'ready' | 'in_progress' | 'hold' | 'completed'
  risk_level: SlaRiskLevel
  risk_label: string
  hours_remaining: number
}

export interface SlaRiskSummary {
  total_on_track: number
  total_risk: number
  total_over_sla: number
  at_risk_orders: SlaRiskOrder[]
}

export interface OperatorOverload {
  operator_id: string
  nama: string
  active_jobs: number
  max_concurrent_capacity: number
  utilization_pct: number
}

export interface FullCapacityDay {
  calendar_date: string
  max_orders: number
  committed: number
}

export interface CapacityWarning {
  capacity_over_100: boolean
  capacity_utilization_pct: number | null
  operator_overload: OperatorOverload[]
  full_capacity_days: FullCapacityDay[]
}

export interface ServiceAvailabilitySignal {
  service_level: ServiceLevel
  hari_d: string | null
  estimated_completion: string | null
  overall_status: 'green' | 'yellow' | 'red'
  signals: { hari_d: string; capacity: string; kpi: string }
  reasons: string[]
  available: boolean
}

export type ServiceAvailability = Record<ServiceLevel, ServiceAvailabilitySignal>

// Full shape of get_owner_summary() (Sprint H) -- composes every Sprint
// B-H signal into one read. Decision Center (Sprint I) is its primary
// consumer.
export interface OwnerSummary {
  sla_risk: SlaRiskSummary
  capacity_warning: CapacityWarning
  bottleneck: BottleneckDashboard
  service_availability: ServiceAvailability
}

// Output of computeTodaysActions() (src/lib/decision/actions.ts) -- computed
// client-side from OwnerSummary, not a database shape.
export interface TodaysAction {
  id: string
  severity: 'critical' | 'warning' | 'info'
  text: string
}
