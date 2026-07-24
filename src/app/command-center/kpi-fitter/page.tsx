import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFitterKpiList } from '@/lib/fitter/client'
import { KpiFitterCenter } from '@/components/owner/kpi-fitter/KpiFitterCenter'

export const metadata: Metadata = {
  title: 'KPI Fitter | Owner OS',
  description: 'Owner OS — Local Tailor Operating System',
  applicationName: 'Owner OS',
  openGraph: {
    title: 'Owner OS',
    description: 'Local Tailor Operating System',
  },
}

// Same auth gate as /command-center/kpi-operator: any logged-in staff
// member, no role restriction.
export default async function KpiFitterPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('id, name').eq('id', user.id).single()

  const fitters = await getFitterKpiList(supabase)

  return <KpiFitterCenter profileName={profile?.name || 'Pemilik'} fitters={fitters} />
}
