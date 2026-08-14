import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MeasurementWorkspace } from '@/components/workspace/MeasurementWorkspace'
import { OrderCreatedLockNotice } from '@/components/workspace/OrderCreatedLockNotice'
import { findOrderIdForConsultation } from '@/lib/order/lookup'
import { FunnelStepOnMount } from '@/components/analytics/FunnelStepOnMount'

// Route contract (locked): Measurement is consultation-driven, not
// order-driven. This folder was previously named [orderId], which was a
// stale label — every query below always resolved a consultation first,
// keyed by consultation_id, never an order. Renamed for clarity; the actual
// value passed by every caller (Check-In, Consultation Review) is and
// always was a consultation id, so this is a pure rename with zero runtime
// behavior change.
interface Props {
  params: { consultationId: string }
}

export default async function MeasurementPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/fitter/login')

  // Request Flow Optimization (STEP 3) — profile (needs only user.id) and
  // consultation (needs only the route param) don't depend on each other's
  // results, so they're fetched together instead of one after another.
  // Same profiles lookup pattern already used in command-center/page.tsx.
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
        stageLabel="Pengukuran"
      />
    )
  }

  // Existing measurement and event history both only need the route param,
  // not each other's results — fetched together instead of sequentially.
  const [{ data: measurement }, { data: events }] = await Promise.all([
    supabase
      .from('measurements')
      .select('*')
      .eq('consultation_id', params.consultationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('business_events')
      .select(`*, profiles(name)`)
      .eq('consultation_id', params.consultationId)
      .order('created_at', { ascending: false }),
  ])

  return (
    <>
      <FunnelStepOnMount step="measurement" />
      <MeasurementWorkspace
        consultation={consultation}
        existingMeasurement={measurement}
        events={events || []}
        userId={user.id}
        fitterName={profile?.name || 'Fitter'}
      />
    </>
  )
}
