import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentRole } from '@/lib/rbac/session'
import { canManageOperators } from '@/lib/operators/access'
import {
  listPieceworkEntries,
  listPieceworkPayrollWeeks,
  listPieceworkRates,
} from '@/lib/piecework/client'
import { PieceworkManager } from '@/components/piecework/PieceworkManager'

export default async function PieceworkPayrollPage() {
  const supabase = createClient()
  const role = await getCurrentRole()

  if (!role) redirect('/owner/login')
  if (!canManageOperators(role)) redirect('/command-center')

  const [rates, weeks, entries] = await Promise.all([
    listPieceworkRates(supabase),
    listPieceworkPayrollWeeks(supabase),
    listPieceworkEntries(supabase),
  ])

  return <PieceworkManager initialRates={rates} initialWeeks={weeks} initialEntries={entries} />
}
