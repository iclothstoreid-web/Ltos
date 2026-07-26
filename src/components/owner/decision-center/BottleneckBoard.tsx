'use client'

import type { SlaRiskOrder } from '@/lib/decision/types'
import { CATEGORY_ORDER, CATEGORY_LABEL } from '@/lib/decision/types'

export { CATEGORY_ORDER, CATEGORY_LABEL }

// Milestone 4 (Priority & Capacity Engine), Section "Bottleneck" -- a third,
// distinct signal from Status SLA and Business Priority above (see the
// brief: "Jangan mencampur ketiganya"). bottleneck_category is computed
// once, server-side, per order in compute_queue_snapshot() -- see
// supabase/migrations/20260814000000_add_priority_capacity_engine.sql for
// exactly what each of the 8 categories is grounded in. This is the
// per-order breakdown; BottleneckSummary below it keeps its existing
// stage/operator aggregate view (slowest stage, most backlogged stage,
// busiest/idle operator) -- the two are complementary, not duplicates.
export function BottleneckBoard({
  orders,
  onSelectOrder,
}: {
  orders: SlaRiskOrder[]
  onSelectOrder: (orderId: string) => void
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Bottleneck per Order</h2>
        <p className="text-body text-secondary">Klik order untuk detail</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CATEGORY_ORDER.map(category => {
          const bucket = orders.filter(o => o.bottleneck_category === category)
          return (
            <div
              key={category}
              className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-outline-variant/80 flex items-center justify-between">
                <p className="text-body font-medium text-on-surface">{CATEGORY_LABEL[category]}</p>
                <span className="text-label text-secondary">{bucket.length}</span>
              </div>

              {bucket.length === 0 ? (
                <p className="px-5 py-6 text-body text-secondary">Tidak ada order.</p>
              ) : (
                <ul className="divide-y divide-outline-variant max-h-[240px] overflow-y-auto">
                  {bucket.map(order => (
                    <li key={order.order_id}>
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order.order_id)}
                        className="w-full text-left px-5 py-3 hover:bg-on-surface/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                      >
                        <p className="text-body font-medium text-on-surface truncate">{order.order_number}</p>
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
