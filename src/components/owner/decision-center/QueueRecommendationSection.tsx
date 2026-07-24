'use client'

import type { BusinessPriority, ServiceLevel, SlaRiskOrder } from '@/lib/decision/types'

const SERVICE_LEVEL_LABELS: Record<ServiceLevel, string> = {
  very_fast: 'Very Fast',
  fast: 'Fast',
  standard: 'Standard',
}

const PRIORITY_BADGE: Record<BusinessPriority, string> = {
  critical: 'text-[#8a2c22] border-[#8a2c22]/40',
  high: 'text-[#7a5a12] border-[#7a5a12]/40',
  normal: 'text-secondary border-outline-variant',
}

const PRIORITY_LABEL: Record<BusinessPriority, string> = {
  critical: 'Kritis',
  high: 'Tinggi',
  normal: 'Normal',
}

// Milestone 4 (Priority & Capacity Engine), "Queue Recommendation": Owner
// gets a recommended production order -- LTOS only recommends, it never
// changes the production workflow itself (no scheduler, no automation, per
// the brief). queue_position is Sprint D's Queue Engine tiebreak chain
// (service level -> Hari D -> Create Order time), computed server-side in
// compute_queue_snapshot() and passed through get_sla_risk_orders() --
// nothing here recomputes ordering, this only sorts and displays it.
// Orders on Hold have queue_position = null (already outside the active
// queue) and are excluded.
export function QueueRecommendationSection({
  orders,
  onSelectOrder,
}: {
  orders: SlaRiskOrder[]
  onSelectOrder: (orderId: string) => void
}) {
  const ranked = orders
    .filter(o => o.queue_position != null)
    .slice()
    .sort((a, b) => (a.queue_position ?? 0) - (b.queue_position ?? 0))

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Rekomendasi Antrian</h2>
        <p className="text-body text-secondary">Rekomendasi saja -- keputusan produksi tetap di tangan Owner/Operator</p>
      </div>

      <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 overflow-hidden">
        {ranked.length === 0 ? (
          <p className="px-5 py-6 text-body text-secondary">Tidak ada order dalam antrian aktif.</p>
        ) : (
          <ul className="divide-y divide-outline-variant max-h-[480px] overflow-y-auto">
            {ranked.map(order => (
              <li key={order.order_id}>
                <button
                  type="button"
                  onClick={() => onSelectOrder(order.order_id)}
                  className="w-full text-left px-5 py-3 flex items-center gap-4 hover:bg-on-surface/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                >
                  <span className="text-label text-secondary w-8 shrink-0 tabular-nums">#{order.queue_position}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-on-surface truncate">{order.order_number}</p>
                    <p className="text-body text-secondary mt-0.5">
                      {order.service_level ? SERVICE_LEVEL_LABELS[order.service_level] : 'Belum dipilih'}
                      {order.hari_d ? ` · Hari D ${new Date(order.hari_d).toLocaleDateString('id-ID')}` : ''}
                    </p>
                  </div>
                  {order.business_priority && (
                    <span
                      className={`shrink-0 text-label uppercase tracking-widest border rounded-full px-2 py-0.5 ${PRIORITY_BADGE[order.business_priority]}`}
                    >
                      {PRIORITY_LABEL[order.business_priority]}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
