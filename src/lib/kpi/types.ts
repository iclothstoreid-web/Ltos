import type { ProductionStage } from '@/lib/production/types'

// Owner OS "KPI Operator" (Sprint G). Every shape here mirrors a jsonb/table
// RPC response 1:1 -- no client-side derivation of numbers that should come
// from the database (see supabase/migrations/20260731000000_add_production_monitoring_dashboard.sql
// and 20260802000000_add_operator_kpi_dashboard.sql).

export interface KpiDashboard {
  total_order_aktif: number
  total_order_selesai: number
  throughput_hari_ini: number
  throughput_minggu_ini: number
  average_production_time_days: number | null
  average_stage_duration_hours: Record<string, number>
}

export interface CapacityDashboard {
  total_operator_aktif: number
  total_capacity: number
  capacity_used: number
  remaining_capacity: number
  capacity_utilization_pct: number | null
}

export interface BottleneckDashboard {
  slowest_stage: string | null
  slowest_stage_avg_hours: number | null
  most_backlogged_stage: string | null
  most_backlogged_stage_count: number | null
  busiest_operator: string | null
  busiest_operator_utilization_pct: number | null
  most_idle_operator: string | null
  most_idle_operator_utilization_pct: number | null
}

// One row of get_operator_capacity() (Sprint B) -- the raw active_jobs/
// max_concurrent_capacity pair get_operator_kpi_list() already composes.
// Used directly (not via the KPI list) wherever only the capacity
// indicator is needed, e.g. AssignOperatorModal, to avoid pulling in
// performance/efficiency data that view doesn't use.
export interface OperatorCapacityRow {
  operator_id: string
  nama: string
  max_concurrent_capacity: number
  active_jobs: number
  utilization_pct: number | null
}

// One row of get_operator_kpi_list() -- the Daftar Operator table.
export interface OperatorKpiRow {
  operator_id: string
  nama: string
  is_active: boolean
  order_dikerjakan: number
  order_selesai: number
  avg_duration_minutes: number | null
  efficiency_pct: number | null
  capacity_utilization_pct: number | null
  active_jobs: number
  max_concurrent_capacity: number
  status: 'Aktif' | 'Non-aktif'
}

export interface OperatorKpiStagePerformance {
  completed_jobs: number
  avg_duration_minutes: number | null
  alter_rate_pct: number | null
}

export interface OperatorKpiJobHistoryRow {
  order_id: string
  order_number: string
  stage: ProductionStage
  started_at: string | null
  completed_at: string | null
  duration_minutes: number | null
}

// The full shape of get_operator_kpi_detail(p_operator_id) -- the Detail
// Operator drill-down opened by clicking a Daftar Operator row.
export interface OperatorKpiDetail {
  profile: {
    operator_id: string
    nama: string
    is_active: boolean
    max_concurrent_capacity: number
    created_at: string
  }
  order_aktif: number
  order_selesai: number
  avg_duration_minutes: number | null
  efficiency_pct: number | null
  capacity: {
    active_jobs: number
    max_concurrent_capacity: number
    utilization_pct: number | null
  }
  performance_per_stage: Partial<Record<ProductionStage, OperatorKpiStagePerformance>>
  riwayat_pekerjaan: OperatorKpiJobHistoryRow[]
}
