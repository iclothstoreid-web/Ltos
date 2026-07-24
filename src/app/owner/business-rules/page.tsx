import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { CapacityCalendarManager } from '@/components/business-rules/CapacityCalendarManager'

// Business Rules = the Hari D capacity calendar (production_capacity_calendar).
// get_capacity_calendar/set_capacity_calendar_day existed since Sprint B with
// no UI (confirmed 0 rows live, "unconfigured = unlimited"). This page is
// the missing admin surface — Sprint K "Capacity Integration" needs an
// actual way for an owner to set daily max_orders for Hari D to mean
// anything.
export default async function BusinessRulesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageOperators(profile?.role)) redirect('/command-center')

  return <CapacityCalendarManager />
}
