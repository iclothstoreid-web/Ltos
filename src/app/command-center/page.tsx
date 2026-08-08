import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser, getCurrentUserProfile } from '@/lib/rbac/session'
import { OwnerCommandCenter } from '@/components/command-center/OwnerCommandCenter/OwnerCommandCenter'
import { EngineOverviewSection } from '@/components/command-center/OwnerCommandCenter/EngineOverviewSection'
import { getBottleneckSeverityByHours, QUEUE_WORKSPACE_URL } from '@/lib/ltos'
import type { BottleneckItem } from '@/components/command-center/OwnerCommandCenter/BottleneckPanel'
import type { AgendaItem } from '@/components/command-center/OwnerCommandCenter/AgendaPanel'
import { getCommercialSummary } from '@/lib/commercial/summary'
import { getCommercialTypeSummary } from '@/lib/commercial/transactionSummary'
import { getMultiGarmentKPIs } from '@/lib/commercial/multiGarmentKPIs'
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

  // Sprint O.5 — identity already verified by middleware for this route
  // (matcher covers /command-center/:path*); reads the forwarded headers
  // instead of repeating auth.getUser() + a self profiles lookup. Kept as
  // two separate calls (not one profile-only check) to preserve the
  // original distinction: redirect only on "not authenticated", never on
  // "authenticated but no profiles row" (profile?.name already tolerated
  // that below via its 'Pemilik' fallback).
  const user = await getCurrentUser()
  if (!user) redirect('/owner/login')

  const profile = await getCurrentUserProfile()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1)

  // Query Optimization (STEP 2, P1) — `orders` and `consultations` were
  // previously 6 and 2 separate round trips respectively, split only by
  // which current_state/status the UI bucket needed. Same rows, same
  // columns as before (plus current_state/customer_id on orders, needed to
  // do the split client-side instead of in SQL) — fetched once each and
  // partitioned below. Revenue-this-month no longer needs its own
  // quotations query either: getCommercialSummary() already scans every
  // non-'not_billable' quotation and now also returns the approved ones
  // (see summary.ts's approvedQuotationRows) for this page to bucket by
  // month/day below, exactly as the removed query did.
  // Request Flow Optimization (STEP 3) — every query below reads only from
  // `supabase`/`todayStart`/`monthStart` (computed above), none of them
  // depend on each other's results, so they're one Promise.all instead of
  // the previous 4-query batch -> separate allStageRecords await -> 8-query
  // batch -> separate materials await -> separate fittingsToday await
  // waterfall (5 sequential round trips -> 1). commercialTypeSummary is the
  // one genuine dependency (needs completedShippingOrderIds, derived from
  // allStageRecords) and stays a separate await right after.
  const [
    { data: ordersAll },
    { data: consultationsCombined },
    { data: artisans },
    { data: vipCustomers },
    { data: allStageRecords },
    { data: materials },
    { count: fittingsToday },
    commercialSummary,
    ownerSummary,
    slaRiskOrders,
    capacityDashboard,
    kpiDashboard,
    operators,
    divisiRows,
    multiGarmentKpis,
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, created_at, current_state, customer_id, customers(name)')
      .order('created_at', { ascending: true }),
    supabase
      .from('consultations')
      .select('id, consultation_number, status, created_at, customers(name)')
      .or(`status.eq.review,created_at.gte.${todayStart.toISOString()}`)
      .order('created_at', { ascending: true }),
    supabase.from('profiles').select('id, name, role').eq('role', 'artisan'),
    supabase.from('customers').select('id, name').eq('is_preferred_client', true),
    supabase
      .from('production_stage_records')
      .select('order_id, stage, status, started_at, created_at, orders(order_number, customers(name))'),
    supabase
      .from('materials')
      .select('id, name, sku, unit, available_stock, min_stock, material_categories(name)'),
    supabase
      .from('business_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'measurement.completed')
      .gte('created_at', todayStart.toISOString()),
    getCommercialSummary(supabase),
    getOwnerSummary(supabase),
    getSlaRiskOrders(supabase),
    getCapacityDashboard(supabase),
    getKpiDashboard(supabase),
    getOperatorKpiList(supabase),
    getDivisiKpiList(supabase),
    getMultiGarmentKPIs(supabase),
  ])

  // Null-safe to match Postgres neq/not-in semantics exactly (a null
  // current_state would never satisfy those filters either) — same
  // partitioning the removed .eq/.neq/.count queries used to do in SQL.
  const isKnownState = (s: string | null) => s != null
  const ordersAwaiting = (ordersAll || []).filter(o => o.current_state === 'order')
  const ordersInQuotation = (ordersAll || []).filter(o => o.current_state === 'quotation')
  const ordersInAppointment = (ordersAll || []).filter(o => o.current_state === 'appointment')
  const activeOrdersCount = (ordersAll || []).filter(
    o => isKnownState(o.current_state) && o.current_state !== 'follow_up'
  ).length
  const followUpTodayCount = (ordersAll || []).filter(o => o.current_state === 'follow_up').length

  const consultationsInReview = (consultationsCombined || []).filter(c => c.status === 'review')

  // Internal 8-stage production workflow now populates production_stage_records
  // — this is the real runtime source of truth for where an order currently
  // sits (orders.current_state only ever reaches 'order'/'follow_up', see
  // the file header note above; Sprint M.2 moved the Production/QC/Ready
  // buckets below off the dead current_state values they used to read).
  // allStageRecords (fetched in the Promise.all above) feeds cutting/sewing
  // (narrowed to in_progress below, unchanged from before), QC, the
  // shipping-ready bucket, the productionToday count, AND the
  // shipping/completed order-id set getCommercialTypeSummary() needs below.
  const activeStageRecords = (allStageRecords || []).filter(r => r.status !== 'completed')
  const completedShippingOrderIds = new Set(
    (allStageRecords || [])
      .filter(r => r.stage === 'shipping' && r.status === 'completed')
      .map(r => r.order_id)
  )

  // Request Flow Optimization (STEP 3): commercialTypeSummary is the one
  // genuine dependency in this page — it needs completedShippingOrderIds,
  // which can only be derived after allStageRecords resolves — so it stays
  // a separate await instead of joining the Promise.all above.
  const commercialTypeSummary = await getCommercialTypeSummary(supabase, completedShippingOrderIds)

  // Sprint N.1 (Owner Intelligence, item 1 — Estimated Completion Date on
  // Dashboard): get_sla_risk_orders already computes estimated_completion
  // per order; this just makes it a lookup so Bottleneck Panel and
  // Production Live Kanban can attach it to their existing rows below. No
  // new RPC/query — slaRiskOrders is already fetched above.
  const estimatedCompletionByOrderId = new Map(
    slaRiskOrders.map(o => [o.order_id, o.estimated_completion])
  )

  // Low Stock notice (Cross Application Integration, LOCKED): Inventory is
  // now real (see src/lib/inventory) — materials at/under their Minimum
  // Stock feed the same Bottleneck Panel every other urgent item does,
  // always 'kritis' since a stock-out blocks production outright.
  // (materials fetched in the Promise.all above.)
  const lowStockMaterials = (materials || []).filter(m => m.available_stock <= m.min_stock)

  // consultationsToday now comes from the merged consultations fetch above
  // (see isKnownState/ordersAwaiting block) instead of a second query here.
  // fittingsToday also fetched in the Promise.all above.
  const consultationsToday = (consultationsCombined || []).filter(
    c => new Date(c.created_at) >= todayStart
  )

  // vipOrdersWaiting now derives from the already-fetched ordersAll instead
  // of a second `orders` query — same customer_id/current_state filters as
  // before, applied in-memory.
  const vipCustomerIds = new Set((vipCustomers || []).map(c => c.id))
  const vipCustomerNameById = new Map((vipCustomers || []).map(c => [c.id, c.name]))
  const vipOrdersWaiting = (ordersAll || []).filter(
    o =>
      o.customer_id != null &&
      vipCustomerIds.has(o.customer_id) &&
      isKnownState(o.current_state) &&
      o.current_state !== 'delivery' &&
      o.current_state !== 'follow_up'
  )

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
      estimatedCompletion: estimatedCompletionByOrderId.get(row.order_id) ?? null,
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
      estimatedCompletion: estimatedCompletionByOrderId.get(o.id) ?? null,
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
      estimatedCompletion: estimatedCompletionByOrderId.get(o.id) ?? null,
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
      estimatedCompletion: r.estimatedCompletion,
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
      estimatedCompletion: estimatedCompletionByOrderId.get(o.id) ?? null,
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

  // Revenue source — quotations.status flips to 'approved' the first time
  // record_order_payment() is called (Sprint K Commercial Engine), and
  // .amount tracks the same post-discount/override total as .total (kept
  // in sync by recompute_quotation_total()). Sums are honestly 0 for any
  // month with no recorded payments yet, not a query bug. Query
  // Optimization (STEP 2, P1): sourced from getCommercialSummary()'s
  // approvedQuotationRows (same underlying scan) instead of a dedicated
  // quotations query.
  const revenueApprovedThisMonth = commercialSummary.approvedQuotationRows.filter(
    q => q.approvedAt >= monthStart.toISOString()
  )
  const revenueThisMonth = revenueApprovedThisMonth.reduce((sum, q) => sum + q.amount, 0)
  const revenueToday = revenueApprovedThisMonth
    .filter(q => new Date(q.approvedAt) >= todayStart)
    .reduce((sum, q) => sum + q.amount, 0)

  const newLeadsCount = (consultationsToday || []).filter(c => c.status === 'check_in').length

  // Sprint D.1 Phase 5 — hasRecommendation is the same ordersWaitingCount > 0
  // condition already used to choose the copy below, exposed as its own
  // field so the Decision surface can render the approved Empty State
  // (Design Language Volume 06 SS10) instead of inferring it from title text.
  const executiveBrief =
    ordersWaitingCount > 0
      ? {
          recommendationTitle: `${ordersWaitingCount} order menunggu penugasan artisan`,
          recommendationBody: `Ada ${ordersWaitingCount} order yang sudah dikonfirmasi tetapi belum ditugaskan ke artisan. Assign artisan untuk melanjutkan ke tahap produksi.`,
          hasRecommendation: true,
        }
      : {
          recommendationTitle: 'Semua order berjalan sesuai jadwal',
          recommendationBody: 'Tidak ada order yang menunggu keputusan Anda saat ini.',
          hasRecommendation: false,
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
  // Sprint N.1 item 4 (Owner Intelligence) -- Payment Aging. REUSE only:
  // commercialSummary.outstandingRows already carries createdAt (just added
  // to the select in summary.ts), bucketed client-side against the same
  // age ranges the roadmap doc names, over the full outstanding population
  // (not the sliced top-5 preview list below).
  const agingDays = (createdAt: string) => (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  const agingBuckets = commercialSummary.outstandingRows.reduce(
    (buckets, row) => {
      const days = agingDays(row.createdAt)
      if (days <= 7) buckets.days0to7 += 1
      else if (days <= 14) buckets.days8to14 += 1
      else if (days <= 30) buckets.days15to30 += 1
      else buckets.daysOver30 += 1
      return buckets
    },
    { days0to7: 0, days8to14: 0, days15to30: 0, daysOver30: 0 }
  )
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
    agingBuckets,
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
        waiting: (ordersAwaiting || []).map(o => ({
          id: o.id,
          order: o.order_number,
          customer: customerName(o),
          estimatedCompletion: estimatedCompletionByOrderId.get(o.id) ?? null,
        })),
        cutting: cuttingOrders,
        sewing: sewingOrders,
        qc: qcRecords.map(({ id, order, customer, estimatedCompletion }) => ({ id, order, customer, estimatedCompletion })),
        ready: shippingReadyRecords.map(({ id, order, customer, estimatedCompletion }) => ({ id, order, customer, estimatedCompletion })),
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
      commercialTypeSummary={commercialTypeSummary}
      multiGarmentKpis={multiGarmentKpis}
    />
  )
}
