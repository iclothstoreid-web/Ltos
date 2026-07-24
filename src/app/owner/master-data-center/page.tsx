import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageMasterData } from '@/lib/design/masterData'
import { canManageOperators } from '@/lib/operators/access'
import { MasterDataCenterHub } from '@/components/master-data/MasterDataCenterHub'

// Sprint K Master Data Center — a hub linking every already-existing (or
// newly added this sprint) master-data surface: Pricing & Design Master
// both live inside /owner/master-data (design_master_options already
// carries `price`, edited inline there — no separate Pricing screen, per
// "Jangan duplicate logic"), Material & Inventory link to the existing
// Inventory app, Operator/Business Rules/Service Rules are new Sprint K
// pages. This page itself has no data of its own — pure navigation.
export default async function MasterDataCenterPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (!canManageMasterData(profile?.role)) {
    redirect('/command-center')
  }

  return <MasterDataCenterHub canManageOperators={canManageOperators(profile?.role)} />
}
