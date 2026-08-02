import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { listAllDivisions } from '@/lib/divisions/client'
import { MasterDivisionManager } from '@/components/master-data/MasterDivisionManager'
import { getCurrentRole } from '@/lib/rbac/session'

// Master Division — Owner OS -> Master Data Center -> Master Division.
// Same admin/owner gate as Operator Management (divisi is operator-scoped
// metadata, not a customer-facing catalog).
export default async function MasterDivisionPage() {
  const supabase = createClient()

  // Sprint O.6 (Wave 1) — identity already verified by middleware for this
  // route; reads the forwarded x-user-role header instead of repeating
  // auth.getUser() + a profiles lookup.
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageOperators(role)) redirect('/command-center')

  const initialDivisions = await listAllDivisions(supabase)

  return <MasterDivisionManager initialDivisions={initialDivisions} />
}
