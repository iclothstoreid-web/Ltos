import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  getBottleneckDashboard,
  getCapacityDashboard,
  getKpiDashboard,
  getOperatorKpiList,
} from '@/lib/kpi/client'
import { KpiOperatorCenter } from '@/components/owner/kpi-operator/KpiOperatorCenter'

export const metadata: Metadata = {
  title: 'KPI Operator | Owner OS',
  description: 'Owner OS — Local Tailor Operating System',
  applicationName: 'Owner OS',
  openGraph: {
    title: 'Owner OS',
    description: 'Local Tailor Operating System',
  },
}

// Owner OS only (per Sprint G's brief) -- KPI Operator moved out of the
// Fitter App entirely. Same auth gate as /command-center and
// /owner/communications: any logged-in staff member, no role restriction.
// Every number on this page comes from Sprint B-F's existing KPI Engine RPCs
// (get_kpi_dashboard, get_capacity_dashboard, get_bottleneck_dashboard) plus
// the two new Sprint G RPCs (get_operator_kpi_list here; get_operator_kpi_detail
// is fetched client-side by OperatorDetailModal on row click) -- no new table.
export default async function KpiOperatorPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('id, name').eq('id', user.id).single()

  const [kpiDashboard, capacityDashboard, bottleneckDashboard, operators] = await Promise.all([
    getKpiDashboard(supabase),
    getCapacityDashboard(supabase),
    getBottleneckDashboard(supabase),
    getOperatorKpiList(supabase),
  ])

  return (
    <KpiOperatorCenter
      profileName={profile?.name || 'Pemilik'}
      kpiDashboard={kpiDashboard}
      capacityDashboard={capacityDashboard}
      bottleneckDashboard={bottleneckDashboard}
      operators={operators}
    />
  )
}
