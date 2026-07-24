import type { SupabaseClient } from '@supabase/supabase-js'
import type { MasterDivision } from './types'

// Master Division — single source of truth for every divisi picklist in
// the app (Operator CRUD, Production App's operator picker, Fitter
// selection). See supabase/migrations/20260805000001_add_master_division.sql.
// get_active_divisions is anon-grantable because the Production kiosk's
// inline "+ Tambah operator baru" divisi picker runs with no login, same
// reasoning as search_operators/list_active_operators.

export async function getActiveDivisions(supabase: SupabaseClient): Promise<MasterDivision[]> {
  const { data, error } = await supabase.rpc('get_active_divisions')
  if (error) throw error
  return (data as MasterDivision[]) || []
}

export async function listAllDivisions(supabase: SupabaseClient): Promise<MasterDivision[]> {
  const { data, error } = await supabase.rpc('list_all_divisions')
  if (error) throw error
  return (data as MasterDivision[]) || []
}

export async function createDivision(supabase: SupabaseClient, name: string): Promise<MasterDivision> {
  const { data, error } = await supabase.rpc('create_division', { p_name: name })
  if (error) throw error
  return data as MasterDivision
}

export async function updateDivision(
  supabase: SupabaseClient,
  divisionId: string,
  name: string
): Promise<MasterDivision> {
  const { data, error } = await supabase.rpc('update_division', { p_division_id: divisionId, p_name: name })
  if (error) throw error
  return data as MasterDivision
}

export async function setDivisionActive(
  supabase: SupabaseClient,
  divisionId: string,
  isActive: boolean
): Promise<MasterDivision> {
  const { data, error } = await supabase.rpc('set_division_active', {
    p_division_id: divisionId,
    p_is_active: isActive,
  })
  if (error) throw error
  return data as MasterDivision
}

export async function swapDivisionOrder(
  supabase: SupabaseClient,
  divisionIdA: string,
  divisionIdB: string
): Promise<void> {
  const { error } = await supabase.rpc('swap_division_order', {
    p_division_id_a: divisionIdA,
    p_division_id_b: divisionIdB,
  })
  if (error) throw error
}
