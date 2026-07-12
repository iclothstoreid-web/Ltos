import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MeasurementWorkspace } from '@/components/workspace/MeasurementWorkspace'

interface Props {
  params: { orderId: string }
}

export default async function MeasurementPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get order with customer
  const { data: order } = await supabase
    .from('orders')
    .select(`*, customers(*)`)
    .eq('id', params.orderId)
    .single()

  if (!order) redirect('/command-center')

  // Get existing measurements if any
  const { data: measurement } = await supabase
    .from('measurements')
    .select('*')
    .eq('order_id', params.orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get event history
  const { data: events } = await supabase
    .from('business_events')
    .select(`*, profiles(name)`)
    .eq('order_id', params.orderId)
    .order('created_at', { ascending: false })

  return (
    <MeasurementWorkspace
      order={order}
      existingMeasurement={measurement}
      events={events || []}
      userId={user.id}
    />
  )
}
