import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { OrderCreatedWorkspace } from '@/components/workspace/order-created/OrderCreatedWorkspace'
import { fetchOrderMessages } from '@/lib/communication/messages'
import type { OrderSnapshot } from '@/lib/order/types'

interface Props {
  params: { orderId: string }
}

export default async function OrderCreatedPage({ params }: Props) {
  const supabase = createClient()

  // Sprint O.3 (TTFB) — identity already verified by middleware for this
  // exact route (matcher covers /workspace/:path*) and forwarded as request
  // headers, instead of this page repeating auth.getUser() + a second
  // profiles lookup (measured ~168ms of pure duplicate work).
  const userId = headers().get('x-user-id')
  if (!userId) redirect('/fitter/login')
  const fitterName = headers().get('x-user-name') || 'Fitter'

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.orderId)
    .single()

  if (!order) redirect('/workspace/check-in')

  // The full snapshot lives on the order.created event's event_data (see
  // lib/order/types.ts for why — no flexible column exists on `orders`).
  const { data: createdEvent } = await supabase
    .from('business_events')
    .select('event_data, created_at')
    .eq('order_id', order.id)
    .eq('event_type', 'order.created')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!createdEvent) redirect('/workspace/check-in')

  const snapshot = createdEvent.event_data as unknown as OrderSnapshot

  // Timeline spans both the order's own events and the earlier
  // consultation-side events (measurement.completed etc. only carry
  // consultation_id, since no order existed yet when they were logged).
  const { data: timelineEvents } = await supabase
    .from('business_events')
    .select('event_type, created_at')
    .or(`order_id.eq.${order.id},consultation_id.eq.${snapshot.consultationId}`)
    .order('created_at', { ascending: true })

  const initialMessages = await fetchOrderMessages(supabase, order.id)

  return (
    <OrderCreatedWorkspace
      order={order}
      snapshot={snapshot}
      orderCreatedAt={createdEvent.created_at}
      timelineEvents={timelineEvents || []}
      fitterName={fitterName}
      profileId={userId}
      initialMessages={initialMessages}
      transactionId={order.transaction_id}
    />
  )
}
