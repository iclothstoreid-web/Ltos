import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QCWorkspace } from '@/components/workspace/QCWorkspace'

interface Props {
  params: { orderId: string }
}

export default async function QCPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`*, customers(*)`)
    .eq('id', params.orderId)
    .single()

  if (!order) redirect('/command-center')

  const { data: measurement } = await supabase
    .from('measurements')
    .select('*')
    .eq('order_id', params.orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: events } = await supabase
    .from('business_events')
    .select(`*, profiles(name)`)
    .eq('order_id', params.orderId)
    .order('created_at', { ascending: false })

  return (
    <QCWorkspace
      order={order}
      measurement={measurement}
      events={events || []}
      userId={user.id}
    />
  )
}
