import type { SupabaseClient } from '@supabase/supabase-js'
import type { CapacityCalendarDay, CapacityOverrideAuditLogEntry } from './types'

// Wraps get_capacity_calendar/set_capacity_calendar_day (shipped Sprint B,
// zero frontend callers until Sprint K's Business Rules page). Sprint K
// (LOCK V1) §12-14 turned the calendar from manual input into a computed
// engine with override-plus-mandatory-reason on top -- see
// supabase/migrations/20260808000000_add_capacity_engine.sql.
export async function getCapacityCalendar(
  supabase: SupabaseClient,
  start: string,
  end: string
): Promise<CapacityCalendarDay[]> {
  const { data, error } = await supabase.rpc('get_capacity_calendar', { p_start: start, p_end: end })
  if (error) throw error
  return (data as CapacityCalendarDay[]) || []
}

export async function setCapacityCalendarDay(
  supabase: SupabaseClient,
  date: string,
  maxOrders: number,
  reason: string,
  notes?: string
): Promise<void> {
  const { error } = await supabase.rpc('set_capacity_calendar_day', {
    p_date: date,
    p_max_orders: maxOrders,
    p_reason: reason,
    p_notes: notes || null,
  })
  if (error) throw error
}

export async function getCapacityOverrideAuditLog(
  supabase: SupabaseClient,
  limit = 20
): Promise<CapacityOverrideAuditLogEntry[]> {
  const { data, error } = await supabase
    .from('capacity_override_audit_log')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as CapacityOverrideAuditLogEntry[]) || []
}
