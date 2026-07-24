import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { getProductionRules } from '@/lib/production/client'
import { ProductionRulesManager } from '@/components/business-rules/ProductionRulesManager'

export default async function ProductionRulesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageOperators(profile?.role)) redirect('/command-center')

  const initialRules = await getProductionRules(supabase)

  return <ProductionRulesManager initialRules={initialRules} />
}
