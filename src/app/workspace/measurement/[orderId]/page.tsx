import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MeasurementWorkspace } from '@/components/workspace/MeasurementWorkspace'
import { OrderCreatedLockNotice } from '@/components/workspace/OrderCreatedLockNotice'
import { findOrderIdForConsultation } from '@/lib/order/lookup'

interface Props {
  params: { orderId: string }
}

export default async function MeasurementPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/fitter/login')

  // Same profiles lookup pattern already used in command-center/page.tsx
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  // Get consultation with customer
  const { data: consultation } = await supabase
    .from('consultations')
    .select(`*, customers(*)`)
    .eq('id', params.orderId)
    .single()

  if (!consultation) redirect('/workspace/check-in')

  if (consultation.status === 'order_created') {
    const orderId = await findOrderIdForConsultation(supabase, consultation.id)
    return (
      <OrderCreatedLockNotice
        consultationNumber={consultation.consultation_number}
        orderId={orderId}
        stageLabel="Measurement"
      />
    )
  }

  // Get existing measurements if any
  const { data: measurement } = await supabase
    .from('measurements')
    .select('*')
    .eq('consultation_id', params.orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get event history
  const { data: events } = await supabase
    .from('business_events')
    .select(`*, profiles(name)`)
    .eq('consultation_id', params.orderId)
    .order('created_at', { ascending: false })

  return (
    <MeasurementWorkspace
      consultation={consultation}
      existingMeasurement={measurement}
      events={events || []}
      userId={user.id}
      fitterName={profile?.name || 'Fitter'}
    />
  )
}
