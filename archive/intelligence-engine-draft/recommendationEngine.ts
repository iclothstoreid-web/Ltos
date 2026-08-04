import type { SlaRiskOrder, TodaysAction } from '@/lib/decision/types'
import type { CommercialSummary } from '@/lib/commercial/summary'
import { PAYMENT_STATUS_LABELS } from '@/lib/commercial/types'
import type { MaterialAttentionItem } from '@/lib/inventory/types'
import type { Decision, IntelligenceDomain } from './types'
import {
  priorityFromSeverity,
  priorityFromSlaRiskLevel,
  priorityFromStockStatus,
  priorityFromPaymentStatus,
} from './priorityEngine'
import { computeConfidence } from './confidenceEngine'

// Recommendation Engine — one function per domain named in the Sprint D.2
// brief (Production, Inventory, Capacity, SLA, Commercial). Every function
// is a pure read over a signal an existing engine already computed
// (get_owner_summary / get_sla_risk_orders / getCommercialSummary /
// getMaterialAttentionList / computeTodaysActions) — no new RPC, no
// re-derivation of a number or a business rule that already exists.
// `priority`/`confidence` always come from Priority Engine/Confidence
// Engine so every domain stays on the same scale.
//
// Production/Capacity/the Commercial DP-outstanding signal all classify an
// already-computed `TodaysAction[]` (from computeTodaysActions() in
// src/lib/decision/actions.ts) rather than re-deciding which conditions
// matter — that function already encodes the Sprint I-approved rule set
// (SLA over/risk, >100% capacity, full Hari D day, red service
// availability, DP outstanding). Callers compute the actions list once
// (decisionEngine.ts) since computeTodaysActions needs the full
// OwnerSummary + optional commercial input together.

interface ActionClassification {
  domain: IntelligenceDomain
  title: string
  impact: string
}

function classifyAction(actionId: string): ActionClassification | null {
  if (actionId === 'sla-over' || actionId === 'sla-risk') {
    return { domain: 'sla', title: 'Ringkasan Risiko SLA', impact: 'Berdampak pada komitmen SLA dan kepuasan customer.' }
  }
  if (actionId === 'capacity-over' || actionId.startsWith('operator-overload-') || actionId.startsWith('capacity-day-')) {
    return { domain: 'capacity', title: 'Kapasitas Produksi', impact: 'Berdampak pada kemampuan menerima order baru.' }
  }
  if (actionId === 'bottleneck-stage' || actionId.startsWith('service-unavailable-')) {
    return { domain: 'production', title: 'Bottleneck Produksi', impact: 'Berdampak pada throughput dan estimasi selesai order.' }
  }
  if (actionId === 'commercial-dp-outstanding') {
    return { domain: 'commercial', title: 'DP/Pembayaran Belum Lunas', impact: 'Berdampak pada arus kas.' }
  }
  // 'all-clear' has nothing to recommend — deliberately excluded, not
  // reclassified into a domain.
  return null
}

// actions.ts's own text convention is "situation — recommendation" (e.g.
// "5 order melewati SLA — prioritaskan penyelesaian segera"); reusing that
// existing convention here (splitting on it) instead of re-deciding what
// the recommendation text should be per action.
function extractRecommendation(text: string): string {
  const parts = text.split(' — ')
  return parts.length > 1 ? parts.slice(1).join(' — ') : text
}

function mapActionToDecision(action: TodaysAction): Decision | null {
  const classification = classifyAction(action.id)
  if (!classification) return null
  return {
    id: `todays-action-${action.id}`,
    domain: classification.domain,
    title: classification.title,
    description: action.text,
    reason: action.text,
    impact: classification.impact,
    recommendation: extractRecommendation(action.text),
    priority: priorityFromSeverity(action.severity),
    confidence: computeConfidence({ completeness: 1, sampleSize: 1 }),
    source: 'computeTodaysActions',
  }
}

function decisionsForDomain(actions: TodaysAction[], domain: IntelligenceDomain): Decision[] {
  return actions
    .map(mapActionToDecision)
    .filter((d): d is Decision => d !== null && d.domain === domain)
}

// ─── Production & Capacity (aggregate, from computeTodaysActions) ────
export function generateProductionRecommendations(actions: TodaysAction[]): Decision[] {
  return decisionsForDomain(actions, 'production')
}

export function generateCapacityRecommendations(actions: TodaysAction[]): Decision[] {
  return decisionsForDomain(actions, 'capacity')
}

// ─── SLA (per-order) ──────────────────────────────────────────────────
// Row-level detail computeTodaysActions() doesn't provide (it only
// summarizes counts) — reuses get_sla_risk_orders()' own fields directly,
// same as Command Center's toOperationalItem() (src/app/command-center/
// page.tsx), just reshaped into a full Decision.
export function generateSlaRecommendations(slaRiskOrders: SlaRiskOrder[]): Decision[] {
  return slaRiskOrders
    .filter(o => o.risk_level !== 'on_track')
    .map(o => {
      const knownFields = [o.customer_name, o.bottleneck_category, o.hari_d]
      return {
        id: `sla-order-${o.order_id}`,
        domain: 'sla' as const,
        title:
          o.risk_level === 'over_sla'
            ? `Order ${o.order_number} melewati SLA`
            : `Order ${o.order_number} berisiko SLA`,
        description: o.risk_label,
        reason: `Sisa waktu ${o.hours_remaining} jam menuju estimasi selesai (${o.estimated_completion}).`,
        impact: o.customer_name
          ? `Berdampak pada pengalaman customer ${o.customer_name}.`
          : 'Berdampak pada komitmen SLA order ini.',
        recommendation: o.bottleneck_category
          ? 'Tinjau bottleneck di stage terkait dan prioritaskan penyelesaian.'
          : 'Prioritaskan penyelesaian order ini segera.',
        priority: priorityFromSlaRiskLevel(o.risk_level),
        confidence: computeConfidence({
          completeness: knownFields.filter(Boolean).length / knownFields.length,
          sampleSize: 1,
        }),
        source: 'get_sla_risk_orders',
        refId: o.order_id,
      }
    })
}

// ─── Inventory (per-material) ─────────────────────────────────────────
// Reuses getMaterialAttentionList() (src/lib/inventory/materials.ts,
// Sprint I.1) as-is — no re-derivation of the reorder-qty heuristic or the
// aman/menipis/habis classification.
export function generateInventoryRecommendations(attentionItems: MaterialAttentionItem[]): Decision[] {
  return attentionItems.map(item => ({
    id: `inventory-material-${item.materialId}`,
    domain: 'inventory' as const,
    title: item.status === 'habis' ? `Stok ${item.name} habis` : `Stok ${item.name} menipis`,
    description: `Tersedia ${item.availableStock} ${item.unit}, minimum ${item.minStock} ${item.unit}.`,
    reason:
      item.status === 'habis'
        ? 'Stok fisik tersedia sudah habis atau di bawah nol.'
        : 'Stok tersedia sudah menyentuh atau di bawah ambang batas minimum.',
    impact: 'Berpotensi menghambat proses produksi yang membutuhkan material ini.',
    recommendation: `Lakukan reorder sebanyak ${item.reorderQty} ${item.unit}.`,
    priority: priorityFromStockStatus(item.status),
    confidence: computeConfidence({ completeness: 1, sampleSize: 1 }),
    source: 'getMaterialAttentionList',
    refId: item.materialId,
  }))
}

// ─── Commercial (per-row + DP-outstanding aggregate) ──────────────────
// Reuses getCommercialSummary() (src/lib/commercial/summary.ts) rows
// as-is — outstanding/discount/override classification already computed
// there against Commercial Rules; this only reshapes each row into a
// Decision. `actions` is the same computeTodaysActions() output Production/
// Capacity classify above, so the DP-outstanding aggregate Decision isn't
// re-derived a second way.
export function generateCommercialRecommendations(
  commercial: CommercialSummary,
  actions: TodaysAction[]
): Decision[] {
  const outstandingDecisions: Decision[] = commercial.outstandingRows.map(row => ({
    id: `commercial-outstanding-${row.orderId}`,
    domain: 'commercial',
    title: `Pembayaran belum lunas — ${row.orderNumber}`,
    description: `${row.customerName}: outstanding ${row.outstandingAmount}.`,
    reason: PAYMENT_STATUS_LABELS[row.paymentStatus],
    impact: 'Berdampak pada arus kas dan cash collected.',
    recommendation: 'Tindak lanjuti penagihan ke customer.',
    priority: priorityFromPaymentStatus(row.paymentStatus),
    confidence: computeConfidence({ completeness: 1, sampleSize: 1 }),
    source: 'getCommercialSummary',
    refId: row.orderId,
  }))

  const highDiscountDecisions: Decision[] = commercial.highDiscountRows.map(row => ({
    id: `commercial-discount-${row.orderId}`,
    domain: 'commercial',
    title: `Diskon di luar batas — ${row.orderNumber}`,
    description: `${row.customerName}: ${row.reason}.`,
    reason: row.reason,
    impact: 'Berpotensi menekan margin di luar Commercial Rules yang berlaku.',
    recommendation: 'Tinjau alasan diskon dan konfirmasi ke Owner bila perlu.',
    priority: 'medium',
    confidence: computeConfidence({ completeness: 1, sampleSize: 1 }),
    source: 'getCommercialSummary',
    refId: row.orderId,
  }))

  const highOverrideDecisions: Decision[] = commercial.highOverrideRows.map(row => ({
    id: `commercial-override-${row.orderId}`,
    domain: 'commercial',
    title: `Owner Override harga — ${row.orderNumber}`,
    description: `${row.customerName}: ${row.reason}.`,
    reason: row.reason,
    impact: 'Berpotensi menekan margin di luar Commercial Rules yang berlaku.',
    recommendation: 'Audit alasan override tercatat untuk order ini.',
    priority: 'medium',
    confidence: computeConfidence({ completeness: row.reason ? 1 : 0.5, sampleSize: 1 }),
    source: 'getCommercialSummary',
    refId: row.orderId,
  }))

  const dpOutstandingDecisions = decisionsForDomain(actions, 'commercial')

  return [...outstandingDecisions, ...highDiscountDecisions, ...highOverrideDecisions, ...dpOutstandingDecisions]
}
