import type { SupabaseClient } from '@supabase/supabase-js'
import type { Operator, OperatorStatus } from '@/lib/production/types'

// Thin wrappers around the operator CRUD RPC surface added in
// supabase/migrations/20260804000000_add_operator_management.sql. Every
// write here is server-side role-gated (admin/owner) inside the RPC itself,
// same defense-in-depth pattern as the rest of this app's SECURITY DEFINER
// functions — canManageOperators() only controls whether the UI is shown.

export async function listAllOperators(supabase: SupabaseClient): Promise<Operator[]> {
  const { data, error } = await supabase.rpc('list_all_operators')
  if (error) throw error
  return (data as Operator[]) || []
}

export async function createOperator(
  supabase: SupabaseClient,
  nama: string,
  divisionId: string | null
): Promise<Operator> {
  const { data, error } = await supabase.rpc('create_operator', { p_nama: nama, p_division_id: divisionId })
  if (error) throw error
  return data as Operator
}

export async function updateOperator(
  supabase: SupabaseClient,
  operatorId: string,
  nama: string,
  divisionId: string | null
): Promise<Operator> {
  const { data, error } = await supabase.rpc('update_operator', {
    p_operator_id: operatorId,
    p_nama: nama,
    p_division_id: divisionId,
  })
  if (error) throw error
  return data as Operator
}

export async function setOperatorStatus(
  supabase: SupabaseClient,
  operatorId: string,
  status: OperatorStatus
): Promise<Operator> {
  const { data, error } = await supabase.rpc('set_operator_status', {
    p_operator_id: operatorId,
    p_status: status,
  })
  if (error) throw error
  return data as Operator
}

export async function softDeleteOperator(supabase: SupabaseClient, operatorId: string): Promise<void> {
  const { error } = await supabase.rpc('soft_delete_operator', { p_operator_id: operatorId })
  if (error) throw error
}
