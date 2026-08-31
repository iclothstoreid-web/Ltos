export type PieceworkStage = 'cutting' | 'sewing'
export type PieceworkRateType = 'base' | 'addon'
export type PieceworkWeekStatus = 'running' | 'ready' | 'paid'

export interface PieceworkRate {
  id: string
  stage: PieceworkStage
  rate_type: PieceworkRateType
  model_name: string | null
  design_field: string | null
  option_value: string | null
  amount: number
  is_active: boolean
  effective_from: string
  effective_to: string | null
  created_at: string
  updated_at: string
}

export interface PieceworkEntry {
  id: string
  stage_record_id: string
  order_id: string
  order_number: string
  operator_id: string
  operator_name: string
  stage: PieceworkStage
  model_name: string | null
  design_snapshot: Record<string, string>
  base_amount: number
  addon_amount: number
  total_amount: number
  rate_breakdown: Record<string, unknown>
  completed_at: string
  payroll_week_start: string
  payroll_week_end: string
}

export interface PieceworkPayrollWeek {
  id: string
  operator_id: string
  operator_name: string
  payroll_week_start: string
  payroll_week_end: string
  piece_count: number
  total_amount: number
  status: PieceworkWeekStatus
  finalized_at: string | null
  paid_at: string | null
  updated_at: string
}
