import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { listAllOperators } from '@/lib/operators/client'
import { getActiveDivisions } from '@/lib/divisions/client'
import { OperatorManager } from '@/components/operators/OperatorManager'

// Admin/Owner only — see src/lib/operators/access.ts for why this is one
// notch tighter than /owner/master-data (no artisan/Fitter access here).
export default async function OperatorManagementPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (!canManageOperators(profile?.role)) {
    redirect('/command-center')
  }

  const [initialOperators, initialDivisions] = await Promise.all([
    listAllOperators(supabase),
    getActiveDivisions(supabase),
  ])

  return <OperatorManager initialOperators={initialOperators} initialDivisions={initialDivisions} />
}
