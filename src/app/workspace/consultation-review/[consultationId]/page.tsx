import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConsultationReviewWorkspace } from '@/components/workspace/consultation-review/ConsultationReviewWorkspace'
import { OrderCreatedLockNotice } from '@/components/workspace/OrderCreatedLockNotice'
import { findOrderIdForConsultation } from '@/lib/order/lookup'

interface Props {
  params: { consultationId: string }
}

export default async function ConsultationReviewPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/fitter/login')

  // Same profiles lookup pattern already used in Measurement/Design Studio
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  // Same query pattern already used by Measurement/Design Studio's page.tsx
  const { data: consultation } = await supabase
    .from('consultations')
    .select(`*, customers(*)`)
    .eq('id', params.consultationId)
    .single()

  if (!consultation) redirect('/workspace/check-in')

  if (consultation.status === 'order_created') {
    const orderId = await findOrderIdForConsultation(supabase, consultation.id)
    return (
      <OrderCreatedLockNotice
        consultationNumber={consultation.consultation_number}
        orderId={orderId}
        stageLabel="Consultation Review"
      />
    )
  }

  const { data: latestMeasurement } = await supabase
    .from('measurements')
    .select('*')
    .eq('consultation_id', params.consultationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <ConsultationReviewWorkspace
      consultation={consultation}
      latestMeasurement={latestMeasurement}
      fitterName={profile?.name || 'Fitter'}
      userId={user.id}
    />
  )
}
