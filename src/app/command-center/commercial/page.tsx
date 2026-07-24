import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CommercialCenter } from '@/components/owner/commercial/CommercialCenter'
import { getCommercialSummary } from '@/lib/commercial/summary'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Commercial Center | Owner OS',
  description: 'Owner OS commercial monitoring.',
}

// This page intentionally composes the existing commercial foundation via
// getCommercialSummary() (src/lib/commercial/summary.ts) -- the Owner
// Dashboard's Commercial pillar reads the exact same function, so there is
// only one place that defines Sales/Cash Collected/Outstanding/DP
// Outstanding. Still no second payment/invoice service or dashboard RPC.
export default async function CommercialCenterPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const [{ data: profile }, summary] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).single(),
    getCommercialSummary(supabase),
  ])

  return (
    <CommercialCenter
      profileName={profile?.name || 'Pemilik'}
      sales={summary.sales}
      cashCollected={summary.cashCollected}
      outstandingPayment={summary.outstandingPayment}
      dpOutstandingCount={summary.dpOutstandingCount}
      minDpPercent={summary.minDpPercent}
      fullPaymentOnly={summary.fullPaymentOnly}
      outstandingRows={summary.outstandingRows}
    />
  )
}
