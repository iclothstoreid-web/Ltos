import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { BusinessRulesHub } from '@/components/business-rules/BusinessRulesHub'

// Business Rules hub — Commercial/Production/Capacity/Service Rules, all
// four backed by real Runtime Configuration read live by their engines.
// Consultation/Notification Rules were removed entirely (UX Cleanup sprint):
// no engine ever read them.
export default async function BusinessRulesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageOperators(profile?.role)) redirect('/command-center')

  return <BusinessRulesHub />
}
