import type { SupabaseClient } from '@supabase/supabase-js'
import type { CapacityCalendarDay } from './types'

// Wraps get_capacity_calendar/set_capacity_calendar_day (shipped Sprint B,
// zero frontend callers until Sprint K's Business Rules page). No new RPC —
// this is purely the missing UI layer over an already-existing Hari D
// capacity table.
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
  notes?: string
): Promise<void> {
  const { error } = await supabase.rpc('set_capacity_calendar_day', {
    p_date: date,
    p_max_orders: maxOrders,
    p_notes: notes || null,
  })
  if (error) throw error
}
