import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OrderSnapshot } from '@/lib/order/types'
import { getProductionPacket } from '@/lib/production/client'
import { getCustomerPhotoForOrder } from '@/lib/production/customerPhoto'
import { getCustomerReferencesForOrder } from '@/lib/production/customerReferences'
import { OrderSummaryWorkspace } from '@/components/workspace/order-summary/OrderSummaryWorkspace'

interface Props {
  params: { orderId: string }
}

// Order Summary — Task 2 of the Fitter Order Monitoring & Shipping
// Experience sprint. Staff-facing (unlike /journey, which is the
// customer-facing equivalent) and 100% read-only. Follows the same fetch
// shape as /workspace/order-created/[orderId]/page.tsx (order row +
// order.created business_events snapshot), plus get_production_packet
// (already SECURITY DEFINER, already used by the kiosk Production Packet)
// for stage_records/progress/design/locked_measurements — no new RPC
// needed for any of this page's reads.
export default async function OrderSummaryPage({ params }: Props) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/fitter/login')

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, customer_token, created_at')
    .eq('id', params.orderId)
    .single()

  if (!order) redirect('/workspace/check-in')

  const { data: createdEvent } = await supabase
    .from('business_events')
    .select('event_data')
    .eq('order_id', order.id)
    .eq('event_type', 'order.created')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!createdEvent) redirect('/workspace/check-in')

  const snapshot = createdEvent.event_data as unknown as OrderSnapshot

  const [packet, customerPhotoUrl, customerReferences] = await Promise.all([
    getProductionPacket(supabase, order.id),
    getCustomerPhotoForOrder(supabase, order.id),
    getCustomerReferencesForOrder(supabase, order.id),
  ])

  return (
    <OrderSummaryWorkspace
      orderId={order.id}
      orderNumber={order.order_number}
      orderCreatedAt={order.created_at}
      estimasi={snapshot.designSpecification?.estimatedProductionSpeed || ''}
      customerToken={order.customer_token}
      customerName={snapshot.customer.name}
      customerPhone={snapshot.customer.phone}
      isPreferredClient={snapshot.customer.isPreferredClient}
      design={packet?.design ?? snapshot.design}
      measurement={packet?.locked_measurements ?? snapshot.measurement}
      bodyTags={snapshot.bodyTags}
      packet={packet}
      customerPhotoUrl={customerPhotoUrl}
      customerReferences={customerReferences}
    />
  )
}
