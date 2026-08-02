import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { CapacityCalendarManager } from '@/components/business-rules/CapacityCalendarManager'
import { getCurrentRole } from '@/lib/rbac/session'

export default async function CapacityRulesPage() {
  const supabase = createClient()

  // Sprint O.6 (Wave 1) — identity already verified by middleware for this
  // route; reads the forwarded x-user-role header instead of repeating
  // auth.getUser() + a profiles lookup.
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageOperators(role)) redirect('/command-center')

  return <CapacityCalendarManager />
}
