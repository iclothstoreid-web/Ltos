import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageOperators } from '@/lib/operators/access'
import { listAllDivisions } from '@/lib/divisions/client'
import { MasterDivisionManager } from '@/components/master-data/MasterDivisionManager'

// Master Division — Owner OS -> Master Data Center -> Master Division.
// Same admin/owner gate as Operator Management (divisi is operator-scoped
// metadata, not a customer-facing catalog).
export default async function MasterDivisionPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageOperators(profile?.role)) redirect('/command-center')

  const initialDivisions = await listAllDivisions(supabase)

  return <MasterDivisionManager initialDivisions={initialDivisions} />
}
