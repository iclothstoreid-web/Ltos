import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { listAllOperators } from '@/lib/operators/client'
import { OperatorManager } from '@/components/operators/OperatorManager'
import { getCurrentRole } from '@/lib/rbac/session'

// Admin/Owner only — see src/lib/operators/access.ts for why this is one
// notch tighter than /owner/master-data (no artisan/Fitter access here).
export default async function OperatorManagementPage() {
  const supabase = createClient()

  // Sprint O.6 (Wave 1) — identity already verified by middleware for this
  // route; reads the forwarded x-user-role header instead of repeating
  // auth.getUser() + a profiles lookup.
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')

  if (!canManageOperators(role)) {
    redirect('/command-center')
  }

  const initialOperators = await listAllOperators(supabase)

  return <OperatorManager initialOperators={initialOperators} />
}
