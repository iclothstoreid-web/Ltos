import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { getServiceSlaRules } from '@/lib/order/service'
import { ServiceRulesManager } from '@/components/business-rules/ServiceRulesManager'

// Service Rules = the SLA Engine's working-day table (service_sla_rules).
// set_service_sla_rule() existed since Sprint C with no UI — this page is
// the missing admin surface, not a new engine.
export default async function ServiceRulesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageOperators(profile?.role)) redirect('/command-center')

  const rules = await getServiceSlaRules(supabase)

  return <ServiceRulesManager initialRules={rules} />
}
