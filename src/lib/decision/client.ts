import type { SupabaseClient } from '@supabase/supabase-js'
import type { OwnerSummary, SlaRiskOrder } from './types'

// Thin wrappers around Sprint H's Production Intelligence RPCs, same
// convention as lib/kpi/client.ts -- takes an explicit `supabase` client
// (server or browser) rather than constructing its own. Both RPCs already
// exist (20260803000000_add_production_intelligence.sql); Decision Center
// (Sprint I) is their first UI consumer.

export async function getOwnerSummary(supabase: SupabaseClient): Promise<OwnerSummary> {
  const { data, error } = await supabase.rpc('get_owner_summary')
  if (error) throw error
  return data as OwnerSummary
}

export async function getSlaRiskOrders(supabase: SupabaseClient): Promise<SlaRiskOrder[]> {
  const { data, error } = await supabase.rpc('get_sla_risk_orders')
  if (error) throw error
  return (data as SlaRiskOrder[]) || []
}
