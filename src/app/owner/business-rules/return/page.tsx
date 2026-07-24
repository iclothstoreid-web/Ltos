import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { getReturnRules } from '@/lib/production/client'
import { ReturnRulesManager } from '@/components/business-rules/ReturnRulesManager'

export default async function ReturnRulesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageOperators(profile?.role)) redirect('/command-center')

  const initialRules = await getReturnRules(supabase)

  return <ReturnRulesManager initialRules={initialRules} />
}
