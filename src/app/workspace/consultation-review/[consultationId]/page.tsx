import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConsultationReviewWorkspace } from '@/components/workspace/consultation-review/ConsultationReviewWorkspace'
import { OrderCreatedLockNotice } from '@/components/workspace/OrderCreatedLockNotice'
import { findOrderIdForConsultation } from '@/lib/order/lookup'
import { fetchActiveMasterOptions } from '@/lib/design/masterData'

interface Props {
  params: { consultationId: string }
}

export default async function ConsultationReviewPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/fitter/login')

  // Request Flow Optimization (STEP 3) — profile (needs only user.id) and
  // consultation (needs only the route param) don't depend on each other's
  // results, so they're fetched together instead of one after another.
  // Same profiles lookup / consultation pattern already used in
  // Measurement/Design Studio's page.tsx.
  const [{ data: profile }, { data: consultation }] = await Promise.all([
    supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('consultations')
      .select(`*, customers(*)`)
      .eq('id', params.consultationId)
      .single(),
  ])

  if (!consultation) redirect('/workspace/check-in')

  if (consultation.status === 'order_created') {
    const orderId = await findOrderIdForConsultation(supabase, consultation.id)
    return (
      <OrderCreatedLockNotice
        consultationNumber={consultation.consultation_number}
        orderId={orderId}
        stageLabel="Tinjauan Konsultasi"
      />
    )
  }

  // latestMeasurement (needs only the route param) and masterOptions (a flat
  // catalog read, needs nothing computed here) don't depend on each other —
  // fetched together instead of sequentially.
  const [{ data: latestMeasurement }, masterOptions] = await Promise.all([
    supabase
      .from('measurements')
      .select('*')
      .eq('consultation_id', params.consultationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    // Same catalog Design Studio reads from — needed here to resolve the
    // Design Specification's price/ID snapshot when Estimasi Pengerjaan
    // updates (see ConsultationReviewWorkspace's persistEnhancements).
    fetchActiveMasterOptions(supabase),
  ])

  return (
    <ConsultationReviewWorkspace
      consultation={consultation}
      latestMeasurement={latestMeasurement}
      masterOptions={masterOptions}
      fitterName={profile?.name || 'Fitter'}
      userId={user.id}
    />
  )
}
