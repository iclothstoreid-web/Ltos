import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { BusinessRulesHub } from '@/components/business-rules/BusinessRulesHub'
import { getCurrentRole } from '@/lib/rbac/session'

// Business Rules hub (Business Configuration Layer, Sprint K Milestone 1) —
// Commercial/Production/Capacity/Return/Service/Notification Rules, all six
// backed by real Runtime Configuration read live by their engines.
export default async function BusinessRulesPage() {
  const supabase = createClient()

  // Sprint O.6 (Wave 1) — identity already verified by middleware for this
  // route; reads the forwarded x-user-role header instead of repeating
  // auth.getUser() + a profiles lookup.
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageOperators(role)) redirect('/command-center')

  return <BusinessRulesHub />
}
