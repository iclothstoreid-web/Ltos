import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { getServiceSlaRules } from '@/lib/order/service'
import { ServiceRulesManager } from '@/components/business-rules/ServiceRulesManager'
import { getCurrentRole } from '@/lib/rbac/session'

export default async function ServiceRulesPage() {
  const supabase = createClient()

  // Sprint O.6 (Wave 1) — identity already verified by middleware for this
  // route; reads the forwarded x-user-role header instead of repeating
  // auth.getUser() + a profiles lookup.
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageOperators(role)) redirect('/command-center')

  const rules = await getServiceSlaRules(supabase)

  return <ServiceRulesManager initialRules={rules} />
}
