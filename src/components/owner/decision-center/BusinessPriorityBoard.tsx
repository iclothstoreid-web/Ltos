'use client'

import type { BusinessPriority, SlaRiskOrder } from '@/lib/decision/types'

export const PRIORITY_ORDER: BusinessPriority[] = ['critical', 'high', 'normal']
export const PRIORITY_HEADING: Record<BusinessPriority, string> = {
  critical: '⛔ Prioritas Kritis',
  high: '🔺 Prioritas Tinggi',
  normal: '➖ Prioritas Normal',
}

// Milestone 4 (Priority & Capacity Engine), Section "Business Priority" --
// a distinct signal from Status SLA above, deliberately not mixed into it
// (see the brief: "Jangan mencampur ketiganya"). Grouped from the same
// get_sla_risk_orders() rows Status SLA already renders -- business_priority
// itself is computed once, server-side, in
// supabase/migrations/20260814000000_add_priority_capacity_engine.sql from
// Target Usage Date, Estimation Validation, SLA risk, Commercial Status,
// Existing Priority (service tier), and Owner Override (Hold) together.
// Orders on Hold have business_priority = null and are intentionally
// excluded here -- Owner Override already took them out of active ranking.
export function BusinessPriorityBoard({
  orders,
  onSelectOrder,
}: {
  orders: SlaRiskOrder[]
  onSelectOrder: (orderId: string) => void
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Business Priority</h2>
        <p className="text-body text-secondary">Klik order untuk detail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PRIORITY_ORDER.map(level => {
          const bucket = orders.filter(o => o.business_priority === level)
          return (
            <div
              key={level}
              className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-outline-variant/80 flex items-center justify-between">
                <p className="text-body font-medium text-on-surface">{PRIORITY_HEADING[level]}</p>
                <span className="text-label text-secondary">{bucket.length}</span>
              </div>

              {bucket.length === 0 ? (
                <p className="px-5 py-6 text-body text-secondary">Tidak ada order.</p>
              ) : (
                <ul className="divide-y divide-outline-variant max-h-[360px] overflow-y-auto">
                  {bucket.map(order => (
                    <li key={order.order_id}>
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order.order_id)}
                        className="w-full text-left px-5 py-3 hover:bg-on-surface/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                      >
                        <p className="text-body font-medium text-on-surface truncate">{order.order_number}</p>
                        <p className="text-body text-secondary mt-0.5">
                          {order.risk_label}
                          {order.estimation_verdict ? ` · Estimasi ${order.estimation_verdict}` : ''}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
