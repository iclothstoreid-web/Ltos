import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchAllMasterOptions } from '@/lib/design/masterData'
import { MasterDataManager } from '@/components/master-data/MasterDataManager'

// Hanya dapat diakses oleh Admin/Owner — same auth pool as Owner/Fitter
// login, gated here on profiles.role rather than a separate login screen.
export default async function MasterDataPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'owner') {
    redirect('/command-center')
  }

  const initialOptions = await fetchAllMasterOptions(supabase)

  return <MasterDataManager initialOptions={initialOptions} />
}
