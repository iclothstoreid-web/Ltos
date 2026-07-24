import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BottleneckDashboard,
  CapacityDashboard,
  KpiDashboard,
  OperatorCapacityRow,
  OperatorKpiDetail,
  OperatorKpiRow,
} from './types'

// Thin wrappers around the KPI Engine's SECURITY DEFINER RPC surface, same
// convention as lib/production/client.ts -- takes an explicit `supabase`
// client (server or browser) rather than constructing its own.
//
// getKpiDashboard/getCapacityDashboard/getBottleneckDashboard call Sprint E's
// existing RPCs unmodified -- the Owner OS KPI Operator dashboard's summary
// section (Total Operator Aktif, Total Order Aktif, Total Order Selesai,
// Average Production Time, Capacity Utilization, Throughput, Bottleneck)
// needs no new RPC at all.

export async function getKpiDashboard(supabase: SupabaseClient): Promise<KpiDashboard> {
  const { data, error } = await supabase.rpc('get_kpi_dashboard')
  if (error) throw error
  return data as KpiDashboard
}

export async function getCapacityDashboard(supabase: SupabaseClient): Promise<CapacityDashboard> {
  const { data, error } = await supabase.rpc('get_capacity_dashboard')
  if (error) throw error
  return data as CapacityDashboard
}

export async function getBottleneckDashboard(supabase: SupabaseClient): Promise<BottleneckDashboard> {
  const { data, error } = await supabase.rpc('get_bottleneck_dashboard')
  if (error) throw error
  return data as BottleneckDashboard
}

export async function getOperatorCapacity(supabase: SupabaseClient): Promise<OperatorCapacityRow[]> {
  const { data, error } = await supabase.rpc('get_operator_capacity')
  if (error) throw error
  return (data as OperatorCapacityRow[]) || []
}

export async function getOperatorKpiList(supabase: SupabaseClient): Promise<OperatorKpiRow[]> {
  const { data, error } = await supabase.rpc('get_operator_kpi_list')
  if (error) throw error
  return (data as OperatorKpiRow[]) || []
}

export async function getOperatorKpiDetail(
  supabase: SupabaseClient,
  operatorId: string
): Promise<OperatorKpiDetail | null> {
  const { data, error } = await supabase.rpc('get_operator_kpi_detail', {
    p_operator_id: operatorId,
  })
  if (error) throw error
  return data as OperatorKpiDetail | null
}
