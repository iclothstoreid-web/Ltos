import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionConfirmation } from '@/components/workspace/order-created/TransactionConfirmation'
import type { OrderSnapshot } from '@/lib/order/types'

interface Props {
  params: { orderId: string }
}

export default async function OrderCreatedPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/fitter/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.orderId)
    .single()

  if (!order) redirect('/workspace/check-in')

  // Milestone B (Multi-Garment): resolve the transaction from the order's
  // transaction_id. The TransactionConfirmation client component will then
  // load the full transaction detail (all garments in the same transaction).
  // This enables the "add garment to transaction" flow from the confirmation
  // page itself.
  const transactionId = order.transaction_id

// For backward compatibility: if the order has no transaction_id (should
  // not happen after Milestone A migration, but guard against edge cases),
  // redirect to the legacy single-order workspace.
  if (!transactionId) {
    const { OrderCreatedWorkspace } = await import(
      '@/components/workspace/order-created/OrderCreatedWorkspace'
    )
    const { fetchOrderMessages } = await import('@/lib/communication/messages')

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
        fitterName={profile?.name || 'Fitter'}
        profileId={user.id}
        initialMessages={initialMessages}
      />
    )
  }

  return (
    <TransactionConfirmation
      transactionId={transactionId}
      currentOrderId={order.id}
      fitterName={profile?.name || 'Fitter'}
    />
  )
}
