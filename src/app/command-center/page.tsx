import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OwnerCommandCenter } from '@/components/command-center/OwnerCommandCenter/OwnerCommandCenter'
import { getUrgency } from '@/lib/ltos'

// OwnerCommandCenter itself is untouched (design/layout unchanged) — this
// file only replaces what data feeds it. It was previously never imported
// anywhere; /command-center rendered a separate, older page built against
// `queue_assignments` (0 rows), which is why every widget showed empty.
//
// The real Fitter workflow (Check-In -> ... -> Create Order) only ever
// advances orders.current_state as far as 'order' — Assign Artisan isn't
// wired yet, and no pricing engine exists — so those counts, plus qc/
// revenue, are genuinely 0 right now, not a query bug. Production's cutting/
// sewing kanban lanes ARE real, though: they read the internal 8-stage
// production_stage_records table (/workspace/production/[orderId]),
// separate from orders.current_state entirely.
export default async function CommandCenterPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const [
    { data: ordersAwaiting },
    { data: ordersInProduction },
    { data: ordersInQc },
    { data: ordersReady },
    { data: consultationsInReview },
    { data: artisans },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'order')
      .order('created_at', { ascending: true }),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'production'),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'qc'),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'delivery'),
    supabase
      .from('consultations')
      .select('id, consultation_number, created_at, customers(name)')
      .eq('status', 'review')
      .order('created_at', { ascending: true }),
    supabase.from('profiles').select('id, name, role').eq('role', 'artisan'),
  ])

  // Internal 8-stage production workflow now populates production_stage_records
  // (readable here via the staff RLS policy) — cutting/sewing are no longer
  // honestly empty, they reflect whichever orders are actively in that stage.
  const { data: activeStageRecords } = await supabase
    .from('production_stage_records')
    .select('order_id, stage, orders(order_number, customers(name))')
    .in('stage', ['cutting', 'sewing'])
    .eq('status', 'in_progress')

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [{ count: consultationsToday }, { count: fittingsToday }] = await Promise.all([
    supabase
      .from('consultations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),
    supabase
      .from('business_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'measurement.completed')
      .gte('created_at', todayStart.toISOString()),
  ])

  // Without a generated Database type, the untyped client infers embedded
  // to-one relations as an array here even though PostgREST returns a
  // single object at runtime for this FK — handling both shapes.
  type Named = {
    customers: { name: string } | { name: string }[] | null
    id: string
    created_at: string
  }
  const customerName = (row: Named) => {
    const c = Array.isArray(row.customers) ? row.customers[0] : row.customers
    return c?.name || 'Unknown'
  }

  // Same untyped-embed ambiguity as `Named` above, one level deeper:
  // production_stage_records -> orders -> customers.
  type StageRecordRow = {
    order_id: string
    stage: 'cutting' | 'sewing'
    orders:
      | { order_number: string; customers: { name: string } | { name: string }[] | null }
      | { order_number: string; customers: { name: string } | { name: string }[] | null }[]
      | null
  }
  const stageRecordCard = (row: StageRecordRow) => {
    const order = Array.isArray(row.orders) ? row.orders[0] : row.orders
    const customers = order?.customers
    const c = Array.isArray(customers) ? customers[0] : customers
    return { id: row.order_id, order: order?.order_number || '—', customer: c?.name || 'Unknown' }
  }
  const cuttingOrders = (activeStageRecords || [])
    .filter(r => r.stage === 'cutting')
    .map(stageRecordCard)
  const sewingOrders = (activeStageRecords || [])
    .filter(r => r.stage === 'sewing')
    .map(stageRecordCard)

  const decisionQueue = [
    ...(ordersAwaiting || []).map(o => ({
      id: o.id,
      priority: getUrgency(o.created_at),
      customer: customerName(o),
      order: o.order_number,
      reason: 'Order dikonfirmasi, menunggu penugasan artisan',
      suggestedAction: 'Tugaskan Artisan',
      workspaceUrl: `/workspace/order-created/${o.id}`,
    })),
    ...(consultationsInReview || []).map(c => ({
      id: c.id,
      priority: getUrgency(c.created_at),
      customer: customerName(c),
      order: c.consultation_number,
      reason: 'Konsultasi direview, order belum dibuat',
      suggestedAction: 'Review Konsultasi',
      workspaceUrl: `/workspace/consultation-review/${c.id}`,
    })),
  ].sort((a, b) => {
    const rank = { critical: 0, high: 1, normal: 2, ready: 3 }
    return rank[a.priority] - rank[b.priority]
  })

  const ordersWaitingCount = ordersAwaiting?.length || 0
  const productionTodayCount = ordersInProduction?.length || 0
  const qcRequiredCount = ordersInQc?.length || 0

  const executiveBrief =
    ordersWaitingCount > 0
      ? {
          recommendationTitle: `${ordersWaitingCount} order menunggu penugasan artisan`,
          recommendationBody: `Ada ${ordersWaitingCount} order yang sudah dikonfirmasi tetapi belum ditugaskan ke artisan. Assign artisan untuk melanjutkan ke tahap produksi.`,
        }
      : {
          recommendationTitle: 'Semua order berjalan sesuai jadwal',
          recommendationBody: 'Tidak ada order yang menunggu keputusan Anda saat ini.',
        }

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <OwnerCommandCenter
      profileName={profile?.name || 'Pemilik'}
      todayLabel={todayLabel}
      summary={{
        ordersWaiting: ordersWaitingCount,
        productionToday: productionTodayCount,
        qcRequired: qcRequiredCount,
        // No pricing engine/quotations data exists yet (see Consultation
        // Review / Order Created sprints) — 0 is the honest figure, not a
        // placeholder bug.
        revenueToday: 0,
      }}
      decisionQueue={decisionQueue}
      executiveBrief={executiveBrief}
      productionColumns={{
        waiting: (ordersAwaiting || []).map(o => ({ id: o.id, order: o.order_number, customer: customerName(o) })),
        cutting: cuttingOrders,
        sewing: sewingOrders,
        qc: (ordersInQc || []).map(o => ({ id: o.id, order: o.order_number, customer: customerName(o) })),
        ready: (ordersReady || []).map(o => ({ id: o.id, order: o.order_number, customer: customerName(o) })),
      }}
      artisanCards={(artisans || []).map(a => ({
        id: a.id,
        name: a.name,
        role: a.role,
        workload: '—',
        capacity: '—',
        qualityScore: '—',
      }))}
      rightTimeline={{
        // No appointment/booking or production-review/delivery-tracking
        // features exist in this repo — 0 reflects that honestly rather
        // than approximating them from unrelated events.
        appointments: 0,
        consultations: consultationsToday || 0,
        fittings: fittingsToday || 0,
        productionReview: 0,
        delivery: 0,
      }}
    />
  )
}
