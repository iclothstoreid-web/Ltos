import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchAllMessages } from '@/lib/communication/messages'
import { STAGE_ORDER } from '@/lib/production/stageConfig'
import type { ProductionStage } from '@/lib/production/types'
import { CommunicationsCenter } from '@/components/owner/communications/CommunicationsCenter'

// Owner OS only (per the locked architecture brief) — Fitter/Production/QC
// workflows and Master Data are untouched. Same auth gate as /command-center:
// any logged-in staff member, no role restriction.
export default async function CommunicationsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('id, name').eq('id', user.id).single()

  const [{ data: orders }, { data: activeStageRecords }, messages] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, current_state, created_at, customers(name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('production_stage_records')
      .select('order_id, stage, orders(order_number, customers(name))')
      .in('stage', STAGE_ORDER)
      .eq('status', 'in_progress'),
    fetchAllMessages(supabase),
  ])

  // Same untyped-embed ambiguity noted in command-center/page.tsx — the
  // untyped client can infer a to-one FK as an array.
  type Named = { customers: { name: string } | { name: string }[] | null }
  const customerName = (row: Named) => {
    const c = Array.isArray(row.customers) ? row.customers[0] : row.customers
    return c?.name || 'Unknown'
  }

  const orderList = (orders ?? []).map(o => ({
    id: o.id,
    orderNumber: o.order_number,
    currentState: o.current_state,
    customerName: customerName(o),
  }))

  type StageRecordRow = {
    order_id: string
    stage: ProductionStage
    orders: { order_number: string; customers: { name: string } | { name: string }[] | null } | { order_number: string; customers: { name: string } | { name: string }[] | null }[] | null
  }
  const stageGroups = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = []
    return acc
  }, {} as Record<ProductionStage, { id: string; orderNumber: string; customerName: string }[]>)

  ;(activeStageRecords as StageRecordRow[] | null ?? []).forEach(row => {
    const order = Array.isArray(row.orders) ? row.orders[0] : row.orders
    if (!order) return
    stageGroups[row.stage].push({
      id: row.order_id,
      orderNumber: order.order_number,
      customerName: customerName(order),
    })
  })

  return (
    <CommunicationsCenter
      profileId={user.id}
      profileName={profile?.name || 'Pemilik'}
      orders={orderList}
      stageGroups={stageGroups}
      initialMessages={messages}
    />
  )
}
