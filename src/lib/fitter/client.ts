import type { SupabaseClient } from '@supabase/supabase-js'
import { FITTER_DIVISI } from '@/lib/production/stageConfig'
import type { FitterKpiDetail, FitterKpiRow } from './types'

// A Fitter is a production_operators row (divisi='Fitting') — reused, not a
// new table. See supabase/migrations/20260804000001_add_fitter_kpi.sql.
// FITTER_DIVISI itself lives in stageConfig.ts (single source of truth for
// all divisi vocabulary, including OPERATOR_DIVISI_OPTIONS) — re-exported
// here so callers only ever need to import from lib/fitter.
export { FITTER_DIVISI }

export async function getFitterKpiList(supabase: SupabaseClient): Promise<FitterKpiRow[]> {
  const { data, error } = await supabase.rpc('get_fitter_kpi_list')
  if (error) throw error
  return (data as FitterKpiRow[]) || []
}

export async function getFitterKpiDetail(
  supabase: SupabaseClient,
  fitterId: string
): Promise<FitterKpiDetail> {
  const { data, error } = await supabase.rpc('get_fitter_kpi_detail', { p_fitter_id: fitterId })
  if (error) throw error
  return data as FitterKpiDetail
}
