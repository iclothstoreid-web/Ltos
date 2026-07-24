import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { getCommercialRules } from '@/lib/commercial/client'
import { CommercialRulesManager } from '@/components/business-rules/CommercialRulesManager'

export default async function CommercialRulesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageOperators(profile?.role)) redirect('/command-center')

  const initialRules = await getCommercialRules(supabase)

  return <CommercialRulesManager initialRules={initialRules} />
}
