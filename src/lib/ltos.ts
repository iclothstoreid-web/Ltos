import { WorkflowState, QueueType, PriorityTask, QueueAssignment } from '@/types'

// ============================================================
// LTOS Core Logic
// Maps workflow states to human-readable labels and queue types
// ============================================================

export const STATE_LABELS: Record<WorkflowState, string> = {
  lead: 'Lead',
  consultation: 'Consultation',
  appointment: 'Appointment',
  measurement: 'Measurement',
  quotation: 'Quotation',
  order: 'Order Confirmed',
  assign: 'Assign Artisan',
  production: 'Production',
  qc: 'Quality Check',
  delivery: 'Delivery',
  follow_up: 'Follow Up',
}

export const QUEUE_LABELS: Record<QueueType, string> = {
  consultation: 'Consultation',
  appointment: 'Appointment',
  measurement: 'Measurement',
  quotation: 'Quotation',
  assign: 'Assign Artisan',
  production: 'Production',
  qc: 'Quality Check',
  delivery: 'Delivery',
  follow_up: 'Follow Up',
}

export const QUEUE_WORKSPACE_URL: Record<QueueType, string> = {
  consultation: '/workspace/consultation',
  appointment: '/workspace/appointment',
  measurement: '/workspace/measurement',
  quotation: '/workspace/quotation',
  assign: '/workspace/assign',
  production: '/production',
  qc: '/workspace/qc',
  delivery: '/workspace/delivery',
  follow_up: '/workspace/follow-up',
}

export function getTaskContext(queueType: QueueType): string {
  const contexts: Record<QueueType, string> = {
    consultation: 'Diskusi kebutuhan customer',
    appointment: 'Jadwalkan fitting session',
    measurement: 'Ambil ukuran badan',
    quotation: 'Buat penawaran harga',
    assign: 'Tentukan artisan pengerjaan',
    production: 'Proses jahit berlangsung',
    qc: 'Inspeksi kualitas garment',
    delivery: 'Siap untuk diserahkan',
    follow_up: 'Follow up kepuasan customer',
  }
  return contexts[queueType]
}

export function getUrgency(
  createdAt: string
): 'critical' | 'high' | 'normal' | 'ready' {
  const hoursWaiting =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  if (hoursWaiting > 48) return 'critical'
  if (hoursWaiting > 24) return 'high'
  return 'normal'
}

// 4-level severity used by the Owner OS's Bottleneck Panel —
// separate scale from getUrgency() above (which only has 3 tiers + "ready")
// because the panel needs a distinct "Sedang" (amber) tier between
// high/normal.
export type BottleneckSeverity = 'kritis' | 'tinggi' | 'sedang' | 'rendah'

export const BOTTLENECK_SEVERITY_LABEL: Record<BottleneckSeverity, string> = {
  kritis: '🔴 Kritis',
  tinggi: '🟠 Tinggi',
  sedang: '🟡 Sedang',
  rendah: '🟢 Rendah',
}

export function getBottleneckSeverityByHours(hoursWaiting: number): BottleneckSeverity {
  if (hoursWaiting > 72) return 'kritis'
  if (hoursWaiting > 48) return 'tinggi'
  if (hoursWaiting > 24) return 'sedang'
  return 'rendah'
}

export function formatWaitingTime(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime()
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}h ${hours % 24}j`
  if (hours > 0) return `${hours}j`
  return 'Baru masuk'
}

export function mapQueueToPriorityTask(
  qa: QueueAssignment & {
    orders: { order_number: string; customers: { name: string } }
  }
): PriorityTask {
  const urgency = getUrgency(qa.created_at)
  return {
    id: qa.id,
    order_id: qa.order_id,
    order_number: qa.orders.order_number,
    customer_name: qa.orders.customers.name,
    task_type: qa.queue_type,
    task_label: QUEUE_LABELS[qa.queue_type],
    context: getTaskContext(qa.queue_type),
    waiting_since: qa.created_at,
    urgency,
    workspace_url: `${QUEUE_WORKSPACE_URL[qa.queue_type]}/${qa.order_id}`,
  }
}

// Production steps for thobe/koko garments
export const DEFAULT_PRODUCTION_STEPS = [
  'Cutting',
  'Sewing Body',
  'Obras',
  'Pasang Kancing',
  'Pressing',
  'Final Check',
]

// QC checklist items
export const QC_CHECKLIST = [
  'Jahitan rapi dan merata',
  'Ukuran sesuai measurement',
  'Obras bersih',
  'Kancing terpasang sempurna',
  'Pressing rapi',
  'Tidak ada cacat bahan',
]
