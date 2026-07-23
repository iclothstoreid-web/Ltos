import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getOwnerSummary, getSlaRiskOrders } from '@/lib/decision/client'
import { getOperatorKpiList } from '@/lib/kpi/client'
import { DecisionCenter } from '@/components/owner/decision-center/DecisionCenter'

export const metadata: Metadata = {
  title: 'Decision Center | Owner OS',
  description: 'Owner OS — Local Tailor Operating System',
  applicationName: 'Owner OS',
  openGraph: {
    title: 'Owner OS',
    description: 'Local Tailor Operating System',
  },
}

// Owner OS's "Decision Center" (Sprint I) -- answers "apa yang harus saya
// lakukan hari ini?" entirely from Sprint B-H's existing RPCs:
// get_owner_summary (capacity/bottleneck/service-availability + SLA counts),
// get_sla_risk_orders (per-order SLA classification for Section 1's
// click-through), and get_operator_kpi_list (Sprint G, for Section 2's
// operator buckets). No new RPC, no new table -- Today's Action (Section 5)
// is computed client-side in src/lib/decision/actions.ts from
// get_owner_summary()'s fields. Same auth gate as every other Owner OS page.
export default async function DecisionCenterPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('id, name').eq('id', user.id).single()

  const [ownerSummary, slaRiskOrders, operators] = await Promise.all([
    getOwnerSummary(supabase),
    getSlaRiskOrders(supabase),
    getOperatorKpiList(supabase),
  ])

  return (
    <DecisionCenter
      profileName={profile?.name || 'Pemilik'}
      ownerSummary={ownerSummary}
      slaRiskOrders={slaRiskOrders}
      operators={operators}
    />
  )
}
