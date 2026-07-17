import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DesignStudioWorkspace } from '@/components/workspace/design-studio/DesignStudioWorkspace'
import { OrderCreatedLockNotice } from '@/components/workspace/OrderCreatedLockNotice'
import { findOrderIdForConsultation } from '@/lib/order/lookup'
import { fetchActiveMasterOptions } from '@/lib/design/masterData'

interface Props {
  params: { consultationId: string }
}

export default async function DesignStudioPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/fitter/login')

  // Same query pattern already used by Measurement's page.tsx
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
        stageLabel="Design Studio"
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const masterOptions = await fetchActiveMasterOptions(supabase)

  return (
    <DesignStudioWorkspace
      consultation={consultation}
      latestMeasurement={latestMeasurement}
      masterOptions={masterOptions}
      canManageMasterData={profile?.role === 'admin' || profile?.role === 'owner'}
      userId={user.id}
    />
  )
}
