import type { ProductionStage } from '@/lib/production/types'
import { STAGE_LABELS } from '@/lib/production/stageConfig'
import type { OwnerSummary, ServiceLevel, TodaysAction } from './types'

const SERVICE_LEVEL_LABELS: Record<ServiceLevel, string> = {
  standard: 'Standard',
  fast: 'Fast',
  very_fast: 'Very Fast',
}

// Section 5 (Sprint I brief): "Today's Action" -- rule-based only, no AI, no
// automation. Every rule below reuses a threshold Sprint C/E/H already
// established (SLA over/risk classification, >100% operator/total capacity,
// a full Hari D calendar day, a red service-availability signal) rather than
// inventing a new one; this function only turns get_owner_summary()'s
// existing fields into text. Pure and side-effect free so it needs no new
// RPC -- called client-side over the OwnerSummary the page already fetched.
export function computeTodaysActions(summary: OwnerSummary): TodaysAction[] {
  const actions: TodaysAction[] = []

  if (summary.sla_risk.total_over_sla > 0) {
    actions.push({
      id: 'sla-over',
      severity: 'critical',
      text: `${summary.sla_risk.total_over_sla} order melewati SLA — prioritaskan penyelesaian segera`,
    })
  }

  if (summary.sla_risk.total_risk > 0) {
    actions.push({
      id: 'sla-risk',
      severity: 'warning',
      text: `${summary.sla_risk.total_risk} order berisiko SLA hari ini — pantau dan percepat`,
    })
  }

  if (summary.capacity_warning.capacity_over_100) {
    const pct = summary.capacity_warning.capacity_utilization_pct
    actions.push({
      id: 'capacity-over',
      severity: 'critical',
      text: `Kapasitas produksi total${pct != null ? ` ${pct}%` : ''} — evaluasi penambahan operator sebelum menerima order baru`,
    })
  }

  summary.capacity_warning.operator_overload.slice(0, 3).forEach(op => {
    actions.push({
      id: `operator-overload-${op.operator_id}`,
      severity: 'warning',
      text: `Operator ${op.nama} kelebihan kapasitas (${op.utilization_pct}%) — redistribusikan pekerjaan ke operator lain`,
    })
  })

  summary.capacity_warning.full_capacity_days.slice(0, 3).forEach(day => {
    const dateLabel = new Date(day.calendar_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })
    actions.push({
      id: `capacity-day-${day.calendar_date}`,
      severity: 'warning',
      text: `Kapasitas Hari D ${dateLabel} sudah penuh (${day.committed}/${day.max_orders}) — batasi order baru untuk tanggal tersebut`,
    })
  })

  if (summary.bottleneck.most_backlogged_stage && (summary.bottleneck.most_backlogged_stage_count ?? 0) > 0) {
    const label =
      STAGE_LABELS[summary.bottleneck.most_backlogged_stage as ProductionStage] || summary.bottleneck.most_backlogged_stage
    actions.push({
      id: 'bottleneck-stage',
      severity: 'info',
      text: `Stage ${label} paling menumpuk (${summary.bottleneck.most_backlogged_stage_count} order) — tinjau alokasi operator ke stage ini`,
    })
  }

  ;(Object.keys(summary.service_availability) as ServiceLevel[]).forEach(level => {
    const signal = summary.service_availability[level]
    if (!signal.available) {
      actions.push({
        id: `service-unavailable-${level}`,
        severity: 'critical',
        text: `${SERVICE_LEVEL_LABELS[level]} tidak direkomendasikan hari ini${
          signal.reasons.length ? ` — ${signal.reasons.join('; ')}` : ''
        }`,
      })
    }
  })

  if (actions.length === 0) {
    actions.push({
      id: 'all-clear',
      severity: 'info',
      text: 'Semua indikator dalam kondisi normal hari ini.',
    })
  }

  return actions
}
