import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  PieceworkEntry,
  PieceworkPayrollWeek,
  PieceworkRate,
  PieceworkRateType,
  PieceworkStage,
  PieceworkWeekStatus,
} from './types'

export async function listPieceworkRates(supabase: SupabaseClient): Promise<PieceworkRate[]> {
  const { data, error } = await supabase
    .from('piecework_rates')
    .select('*')
    .order('stage')
    .order('rate_type')
    .order('model_name')
    .order('design_field')
    .order('option_value')

  if (error) throw error
  return (data as PieceworkRate[]) || []
}

export async function createPieceworkRate(
  supabase: SupabaseClient,
  input: {
    stage: PieceworkStage
    rateType: PieceworkRateType
    modelName?: string | null
    designField?: string | null
    optionValue?: string | null
    amount: number
  }
): Promise<PieceworkRate> {
  const { data, error } = await supabase
    .from('piecework_rates')
    .insert({
      stage: input.stage,
      rate_type: input.rateType,
      model_name: input.modelName || null,
      design_field: input.designField || null,
      option_value: input.optionValue || null,
      amount: input.amount,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as PieceworkRate
}

export async function updatePieceworkRate(
  supabase: SupabaseClient,
  rateId: string,
  patch: { amount?: number; is_active?: boolean }
): Promise<PieceworkRate> {
  const { data, error } = await supabase
    .from('piecework_rates')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', rateId)
    .select('*')
    .single()

  if (error) throw error
  return data as PieceworkRate
}

export async function listPieceworkPayrollWeeks(
  supabase: SupabaseClient
): Promise<PieceworkPayrollWeek[]> {
  const { data, error } = await supabase
    .from('piecework_payroll_weeks')
    .select('*')
    .order('payroll_week_start', { ascending: false })
    .order('operator_name')

  if (error) throw error
  return (data as PieceworkPayrollWeek[]) || []
}

export async function listPieceworkEntries(
  supabase: SupabaseClient,
  weekStart?: string
): Promise<PieceworkEntry[]> {
  let query = supabase
    .from('piecework_entries')
    .select('*')
    .order('completed_at', { ascending: false })

  if (weekStart) query = query.eq('payroll_week_start', weekStart)

  const { data, error } = await query
  if (error) throw error
  return (data as PieceworkEntry[]) || []
}

export async function updatePieceworkWeekStatus(
  supabase: SupabaseClient,
  weekId: string,
  status: PieceworkWeekStatus
): Promise<PieceworkPayrollWeek> {
  const now = new Date().toISOString()
  const patch: Record<string, string | null> = {
    status,
    updated_at: now,
  }

  if (status === 'ready') patch.finalized_at = now
  if (status === 'paid') {
    patch.finalized_at = now
    patch.paid_at = now
  }
  if (status === 'running') {
    patch.finalized_at = null
    patch.paid_at = null
  }

  const { data, error } = await supabase
    .from('piecework_payroll_weeks')
    .update(patch)
    .eq('id', weekId)
    .select('*')
    .single()

  if (error) throw error
  return data as PieceworkPayrollWeek
}
