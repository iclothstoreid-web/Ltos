import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OwnerCommandCenter } from '@/components/command-center/OwnerCommandCenter/OwnerCommandCenter'
import { EngineOverviewSection } from '@/components/command-center/OwnerCommandCenter/EngineOverviewSection'
import { getBottleneckSeverityByHours, QUEUE_WORKSPACE_URL } from '@/lib/ltos'
import type { BottleneckItem } from '@/components/command-center/OwnerCommandCenter/BottleneckPanel'
import type { AgendaItem } from '@/components/command-center/OwnerCommandCenter/AgendaPanel'
import { getCommercialSummary } from '@/lib/commercial/summary'
import { PAYMENT_STATUS_LABELS } from '@/lib/commercial/types'
import { getOwnerSummary, getSlaRiskOrders } from '@/lib/decision/client'
import { computeTodaysActions } from '@/lib/decision/actions'
import type { BottleneckCategory, SlaRiskOrder } from '@/lib/decision/types'
import { CATEGORY_LABEL } from '@/lib/decision/types'
import { getCapacityDashboard, getKpiDashboard, getOperatorKpiList, getDivisiKpiList } from '@/lib/kpi/client'

// OwnerCommandCenter itself is untouched in structure (chrome/layout unchanged)
// — this file only feeds it real data. /command-center previously rendered a
// separate, older page built against `queue_assignments` (0 rows), which is
// why every widget showed empty; that page was replaced by this one.
//
// The real Fitter workflow (Check-In -> ... -> Create Order) only ever
// advances orders.current_state as far as 'order' — Assign Artisan isn't
// wired yet. There is also no down-payment (DP), stock/material-inventory,
// or appointment-with-time model anywhere in the schema, so "Menunggu DP"
// and any fabric-stock bottleneck are honestly 0 / omitted rather than
// guessed at. Everything else below (revenue, quotation, QC, VIP, follow-up,
// production) reads real tables/columns that already exist.
export default async function CommandCenterPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1)

  const [
    { data: ordersAwaiting },
    { data: ordersInQuotation },
    { data: ordersInAppointment },
    { data: consultationsInReview },
    { data: artisans },
    { count: activeOrdersCount },
    { count: followUpTodayCount },
    { data: vipCustomers },
    { data: quotationsApprovedThisMonth },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'order')
      .order('created_at', { ascending: true }),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'quotation')
      .order('created_at', { ascending: true }),
    supabase
      .from('orders')
      .select('id, order_number, created_at, customers(name)')
      .eq('current_state', 'appointment'),
    supabase
      .from('consultations')
      .select('id, consultation_number, created_at, customers(name)')
      .eq('status', 'review')
      .order('created_at', { ascending: true }),
    supabase.from('profiles').select('id, name, role').eq('role', 'artisan'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .neq('current_state', 'follow_up'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('current_state', 'follow_up'),
    supabase.from('customers').select('id, name').eq('is_preferred_client', true),
    // Revenue source — quotations.status flips to 'approved' the first time
    // record_order_payment() is called (Sprint K Commercial Engine), and
    // .amount tracks the same post-discount/override total as .total (kept
    // in sync by recompute_quotation_total()). Sums are honestly 0 for any
    // month with no recorded payments yet, not a query bug.
    supabase
      .from('quotations')
      .select('amount, approved_at')
      .eq('status', 'approved')
      .gte('approved_at', monthStart.toISOString()),
  ])

  // Sprint K Dashboard Integration: every number the Engine Overview section
  // needs, reusing the exact RPCs/queries Decision Center, KPI Operator, and
  // Commercial Center already fetch server-side — no new RPC.
  const [commercialSummary, ownerSummary, slaRiskOrders, capacityDashboard, kpiDashboard, operators, divisiRows] =
    await Promise.all([
      getCommercialSummary(supabase),
      getOwnerSummary(supabase),
      getSlaRiskOrders(supabase),
      getCapacityDashboard(supabase),
      getKpiDashboard(supabase),
      getOperatorKpiList(supabase),
      getDivisiKpiList(supabase),
    ])

  // Internal 8-stage production workflow now populates production_stage_records
  // — this is the real runtime source of truth for where an order currently
  // sits (orders.current_state only ever reaches 'order'/'follow_up', see
  // the file header note above; Sprint M.2 moved the Production/QC/Ready
  // buckets below off the dead current_state values they used to read).
  // One broad fetch (every stage, anything not yet completed) feeds
  // cutting/sewing (narrowed to in_progress below, unchanged from before),
  // QC, and the shipping-ready bucket, plus the productionToday count.
  const { data: activeStageRecords } = await supabase
    .from('production_stage_records')
    .select('order_id, stage, status, started_at, created_at, orders(order_number, customers(name))')
    .neq('status', 'completed')

  // Low Stock notice (Cross Application Integration, LOCKED): Inventory is
  // now real (see src/lib/inventory) — materials at/under their Minimum
  // Stock feed the same Bottleneck Panel every other urgent item does,
  // always 'kritis' since a stock-out blocks production outright.
  const { data: materials } = await supabase
    .from('materials')
    .select('id, name, sku, unit, available_stock, min_stock, material_categories(name)')

  const lowStockMaterials = (materials || []).filter(m => m.available_stock <= m.min_stock)

  const [{ data: consultationsToday }, { count: fittingsToday }] = await Promise.all([
    supabase
      .from('consultations')
      .select('id, consultation_number, status, created_at, customers(name)')
      .gte('created_at', todayStart.toISOString()),
    supabase
      .from('business_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'measurement.completed')
      .gte('created_at', todayStart.toISOString()),
  ])

  const vipCustomerIds = (vipCustomers || []).map(c => c.id)
  const vipCustomerNameById = new Map((vipCustomers || []).map(c => [c.id, c.name]))
  const { data: vipOrdersWaiting } = vipCustomerIds.length
    ? await supabase
        .from('orders')
        .select('id, order_number, created_at, current_state, customer_id')
        .in('customer_id', vipCustomerIds)
        .not('current_state', 'in', '(delivery,follow_up)')
    : { data: [] as Array<{ id: string; order_number: string; created_at: string; current_state: string; customer_id: string }> }

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
    stage: 'cutting' | 'sewing' | 'qc' | 'shipping'
    status: 'pending' | 'in_progress' | 'completed'
    started_at: string | null
    created_at: string
    orders:
      | { order_number: string; customers: { name: string } | { name: string }[] | null }
      | { order_number: string; customers: { name: string } | { name: string }[] | null }[]
      | null
  }
  const stageRecordCard = (row: StageRecordRow) => {
    const order = Array.isArray(row.orders) ? row.orders[0] : row.orders
    const customers = order?.customers
    const c = Array.isArray(customers) ? customers[0] : customers
    return {
      id: row.order_id,
      order: order?.order_number || '—',
      customer: c?.name || 'Unknown',
      waitingSince: row.started_at || row.created_at,
    }
  }
  const cuttingOrders = (activeStageRecords || [])
    .filter(r => r.stage === 'cutting' && r.status === 'in_progress')
    .map(stageRecordCard)
  const sewingOrders = (activeStageRecords || [])
    .filter(r => r.stage === 'sewing' && r.status === 'in_progress')
    .map(stageRecordCard)
  // QC "menumpuk" and shipping "siap dikirim" mean waiting-at-the-gate, not
  // necessarily already picked up by an operator — pending and in_progress
  // both count, unlike cutting/sewing above which only show active work.
  const qcRecords = (activeStageRecords || [])
    .filter(r => r.stage === 'qc')
    .map(stageRecordCard)
  const shippingReadyRecords = (activeStageRecords || [])
    .filter(r => r.stage === 'shipping')
    .map(stageRecordCard)
  const productionTodayCount = new Set((activeStageRecords || []).map(r => r.order_id)).size

  const hoursWaiting = (createdAt: string) =>
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)

  const vipWorkspaceUrl = (state: string, orderId: string) => {
    const url = (QUEUE_WORKSPACE_URL as Record<string, string>)[state]
    return url ? `${url}/${orderId}` : `/workspace/order-created/${orderId}`
  }

  const bottleneckItems: BottleneckItem[] = [
    ...(ordersAwaiting || []).map(o => ({
      id: `assign-${o.id}`,
      orderId: o.id,
      severity: getBottleneckSeverityByHours(hoursWaiting(o.created_at)),
      customer: customerName(o),
      order: o.order_number,
      reason: 'Order dikonfirmasi, menunggu penugasan artisan',
      suggestedAction: 'Tugaskan Artisan',
      workspaceUrl: `/workspace/order-created/${o.id}`,
    })),
    ...(consultationsInReview || []).map(c => ({
      id: `review-${c.id}`,
      severity: getBottleneckSeverityByHours(hoursWaiting(c.created_at)),
      customer: customerName(c),
      order: c.consultation_number,
      reason: 'Konsultasi direview, order belum dibuat',
      suggestedAction: 'Review Konsultasi',
      workspaceUrl: `/workspace/consultation-review/${c.id}`,
    })),
    ...(ordersInQuotation || []).map(o => ({
      id: `quotation-${o.id}`,
      orderId: o.id,
      severity: getBottleneckSeverityByHours(hoursWaiting(o.created_at)),
      customer: customerName(o),
      order: o.order_number,
      reason: 'Quotation belum disetujui customer',
      suggestedAction: 'Review Quotation',
      workspaceUrl: `/workspace/quotation/${o.id}`,
    })),
    ...qcRecords.map(r => ({
      id: `qc-${r.id}`,
      orderId: r.id,
      severity: getBottleneckSeverityByHours(hoursWaiting(r.waitingSince)),
      customer: r.customer,
      order: r.order,
      reason: 'QC menumpuk, order menunggu inspeksi',
      suggestedAction: 'Proses QC',
      workspaceUrl: `/workspace/qc/${r.id}`,
    })),
    ...(vipOrdersWaiting || []).map(o => ({
      id: `vip-${o.id}`,
      orderId: o.id,
      severity: getBottleneckSeverityByHours(hoursWaiting(o.created_at)),
      customer: vipCustomerNameById.get(o.customer_id) || 'Unknown',
      order: o.order_number,
      reason: 'Customer VIP menunggu, prioritaskan',
      suggestedAction: 'Lihat Order',
      workspaceUrl: vipWorkspaceUrl(o.current_state, o.id),
    })),
    ...lowStockMaterials.map(m => {
      const category = Array.isArray(m.material_categories) ? m.material_categories[0] : m.material_categories
      return {
        id: `stock-${m.id}`,
        severity: 'kritis' as const,
        customer: category?.name || 'Material',
        order: m.sku || '—',
        reason: `Stok ${m.name} di bawah ambang batas (${m.available_stock.toLocaleString('id-ID')} ${m.unit} tersisa)`,
        suggestedAction: 'Tinjau Stok',
        workspaceUrl: `/inventory/material?material=${m.id}`,
      }
    }),
  ]

  const ordersWaitingCount = ordersAwaiting?.length || 0
  const qcTodayCount = qcRecords.length

  const revenueThisMonth = (quotationsApprovedThisMonth || []).reduce(
    (sum, q) => sum + (q.amount || 0),
    0
  )
  const revenueToday = (quotationsApprovedThisMonth || [])
    .filter(q => q.approved_at && new Date(q.approved_at) >= todayStart)
    .reduce((sum, q) => sum + (q.amount || 0), 0)

  const newLeadsCount = (consultationsToday || []).filter(c => c.status === 'check_in').length

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

  const agendaItems: AgendaItem[] = [
    ...(ordersInAppointment || []).map(o => ({
      id: `appt-${o.id}`,
      type: 'Janji Temu' as const,
      customer: customerName(o),
      label: `Order ${o.order_number}`,
    })),
    ...(consultationsToday || []).map(c => ({
      id: `consult-${c.id}`,
      type: 'Konsultasi' as const,
      customer: customerName(c),
      label: `Konsultasi ${c.consultation_number}`,
    })),
    ...(fittingsToday
      ? [
          {
            id: 'fitting-summary',
            type: 'Fitting' as const,
            customer: `${fittingsToday} sesi`,
            label: 'Pengukuran selesai hari ini',
          },
        ]
      : []),
    ...qcRecords.map(r => ({
      id: `review-${r.id}`,
      type: 'Review Produksi' as const,
      customer: r.customer,
      label: `Order ${r.order} menunggu keputusan QC`,
    })),
    ...shippingReadyRecords.map(r => ({
      id: `delivery-${r.id}`,
      type: 'Pengiriman' as const,
      customer: r.customer,
      label: `Order ${r.order} siap dikirim`,
    })),
  ]

  // ─── Sprint N.1/N.2 — Actionable Decision Layer V1 ─────────────
  // Every card is composed client-side from data existing RPCs already
  // return in this page — no new engine, no new RPC, no new dashboard.
  // N.2 turns each card's raw counts into Insight -> Recommendation ->
  // Action: a reason, a recommended action, and a deep link per item.

  const bottleneckActionLabel = (category: BottleneckCategory | null) =>
    category ? `Tinjau bottleneck ${CATEGORY_LABEL[category]}` : 'Tinjau order'

  // Decision Card 1 — Operational Alert
  // Reuses Queue Engine (slaRiskOrders risk_level + risk_label +
  // bottleneck_category — all already computed server-side by
  // get_sla_risk_orders()), Production Runtime (ownerSummary.bottleneck),
  // Capacity (ownerSummary.capacity_warning). CATEGORY_LABEL is the same
  // map BottleneckBoard (Decision Center) already uses for
  // bottleneck_category, reused as-is rather than re-invented here.
  const toOperationalItem = (o: SlaRiskOrder) => ({
    orderId: o.order_id,
    orderNumber: o.order_number,
    customerName: o.customer_name,
    reason: o.risk_label,
    action: bottleneckActionLabel(o.bottleneck_category),
  })
  const operationalAlertCardData = {
    ordersOverSla: ownerSummary.sla_risk.total_over_sla,
    ordersNearSla: ownerSummary.sla_risk.total_risk,
    bottleneckStage: ownerSummary.bottleneck.most_backlogged_stage,
    bottleneckCount: ownerSummary.bottleneck.most_backlogged_stage_count,
    operatorOverload: ownerSummary.capacity_warning.operator_overload,
    overSlaItems: slaRiskOrders
      .filter(o => o.risk_level === 'over_sla')
      .sort((a, b) => a.hours_remaining - b.hours_remaining)
      .slice(0, 5)
      .map(toOperationalItem),
    nearSlaItems: slaRiskOrders
      .filter(o => o.risk_level === 'risk')
      .sort((a, b) => a.hours_remaining - b.hours_remaining)
      .slice(0, 5)
      .map(toOperationalItem),
  }

  // Decision Card 2 — Commercial Alert
  // Reuses Commercial Engine (getCommercialSummary, extended in Sprint N.2
  // to also read discount/override columns already on `quotations`). No
  // due_date column exists anywhere in the schema, so "overdue" is defined
  // from two already-fetched signals rather than a new one: an outstanding
  // payment on an order that Queue Engine already classifies as over_sla.
  const overSlaOrderIds = new Set(
    slaRiskOrders.filter(o => o.risk_level === 'over_sla').map(o => o.order_id)
  )
  const overdueItems = commercialSummary.outstandingRows
    .filter(r => overSlaOrderIds.has(r.orderId))
    .slice(0, 5)
    .map(r => ({
      orderId: r.orderId,
      orderNumber: r.orderNumber,
      customerName: r.customerName,
      amount: r.outstandingAmount,
      reason: 'Order melewati SLA dengan pembayaran belum lunas',
    }))
  const commercialAlertCardData = {
    outstandingPayment: commercialSummary.outstandingPayment,
    dpOutstandingCount: commercialSummary.dpOutstandingCount,
    overdueCount: overdueItems.length,
    highDiscountCount: commercialSummary.highDiscountRows.length,
    highOverrideCount: commercialSummary.highOverrideRows.length,
    overdueItems,
    outstandingItems: commercialSummary.outstandingRows.slice(0, 5).map(r => ({
      orderId: r.orderId,
      orderNumber: r.orderNumber,
      customerName: r.customerName,
      amount: r.outstandingAmount,
      reason: PAYMENT_STATUS_LABELS[r.paymentStatus],
    })),
    highDiscountItems: commercialSummary.highDiscountRows.slice(0, 5),
    highOverrideItems: commercialSummary.highOverrideRows.slice(0, 5),
  }

  // Decision Card 3 — Inventory Alert
  // Reuses Inventory (materials table, already fetched for low stock).
  const lowStockMats = (materials || []).filter(m => m.available_stock <= m.min_stock)
  const outOfStockMats = (materials || []).filter(m => m.available_stock <= 0)
  const topReorderItems = lowStockMats
    .map(m => ({
      materialId: m.id,
      name: m.name,
      available: m.available_stock,
      minStock: m.min_stock,
      unit: m.unit,
      reorderQty: Math.max(m.min_stock * 2 - m.available_stock, 1),
    }))
    .sort((a, b) => (a.available / (a.minStock || 1)) - (b.available / (b.minStock || 1)))
  const inventoryAlertCardData = {
    lowStockCount: lowStockMats.length,
    outOfStockCount: outOfStockMats.length,
    topReorderItems: topReorderItems.slice(0, 5),
    mostCriticalItem: topReorderItems[0] || null,
  }

  // Decision Card 4 — Business Insight
  // Reuses KPI (getKpiDashboard) + slaRiskOrders + computeTodaysActions()
  // (src/lib/decision/actions.ts) — the exact same rule-based
  // Insight->Recommendation function EngineOverviewSection/Decision Center
  // already render above this section, just surfaced here too.
  const completedOrders = kpiDashboard.total_order_selesai
  const activeOrdersCountVal = kpiDashboard.total_order_aktif
  const qcReturnCount = slaRiskOrders.filter(
    o => o.bottleneck_category === 'qc'
  ).length
  const SEVERITY_RANK = { critical: 0, warning: 1, info: 2 } as const
  const topActions = [...computeTodaysActions(ownerSummary, { dpOutstandingCount: commercialSummary.dpOutstandingCount })]
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, 2)
  const businessInsightCardData = {
    completionRate: activeOrdersCountVal > 0
      ? completedOrders / (activeOrdersCountVal + completedOrders)
      : null,
    qcReturnCount,
    throughputHariIni: kpiDashboard.throughput_hari_ini,
    throughputMingguIni: kpiDashboard.throughput_minggu_ini,
    activeOrders: activeOrdersCountVal,
    completedOrders,
    topActions,
    workspaceHref: '/command-center/decision-center',
  }

  return (
    <OwnerCommandCenter
      profileName={profile?.name || 'Pemilik'}
      todayLabel={todayLabel}
      engineOverview={{
        commercial: commercialSummary,
        ownerSummary,
        slaRiskOrders,
        capacityDashboard,
        kpiDashboard,
        operators,
        divisiRows,
      }}
      summary={{
        revenueToday,
        revenueThisMonth,
        activeOrders: activeOrdersCount || 0,
        productionToday: productionTodayCount,
        qcToday: qcTodayCount,
      }}
      crmSnapshot={{
        newLeads: newLeadsCount,
        consultationsToday: consultationsToday?.length || 0,
        waitingQuotation: ordersInQuotation?.length || 0,
        // Commercial Engine now tracks DP/payment status for real (Sprint K)
        // — reuses the same dpOutstandingCount the Commercial pillar shows,
        // replacing the honest-but-stale "0" from before that engine existed.
        waitingDp: commercialSummary.dpOutstandingCount,
        followUpToday: followUpTodayCount || 0,
        vipCustomers: vipCustomers?.length || 0,
      }}
      bottleneckItems={bottleneckItems}
      executiveBrief={executiveBrief}
      productionColumns={{
        waiting: (ordersAwaiting || []).map(o => ({ id: o.id, order: o.order_number, customer: customerName(o) })),
        cutting: cuttingOrders,
        sewing: sewingOrders,
        qc: qcRecords.map(({ id, order, customer }) => ({ id, order, customer })),
        ready: shippingReadyRecords.map(({ id, order, customer }) => ({ id, order, customer })),
      }}
      artisanCards={(artisans || []).map(a => ({
        id: a.id,
        name: a.name,
        role: a.role,
        workload: '—',
        capacity: '—',
        qualityScore: '—',
      }))}
      agendaItems={agendaItems}
      decisionCards={{
        operationalAlert: operationalAlertCardData,
        commercialAlert: commercialAlertCardData,
        inventoryAlert: inventoryAlertCardData,
        businessInsight: businessInsightCardData,
      }}
    />
  )
}
