import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { getNotificationRules } from '@/lib/production/client'
import { NotificationRulesManager } from '@/components/business-rules/NotificationRulesManager'

export default async function NotificationRulesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageOperators(profile?.role)) redirect('/command-center')

  const initialRules = await getNotificationRules(supabase)

  return <NotificationRulesManager initialRules={initialRules} />
}
