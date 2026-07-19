import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchAllMasterOptions, canManageMasterData } from '@/lib/design/masterData'
import { MasterDataManager } from '@/components/master-data/MasterDataManager'

// Shared by Owner OS and Fitter — both reach this exact page/component, no
// separate implementation. Gated on profiles.role (admin/owner/artisan) via
// the single canManageMasterData() source of truth.
export default async function MasterDataPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!canManageMasterData(profile?.role)) {
    redirect('/command-center')
  }

  const initialOptions = await fetchAllMasterOptions(supabase)

  return <MasterDataManager initialOptions={initialOptions} />
}
