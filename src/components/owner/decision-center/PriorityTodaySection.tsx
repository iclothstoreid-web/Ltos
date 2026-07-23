'use client'

import type { SlaRiskLevel, SlaRiskOrder } from '@/lib/decision/types'

const RISK_ORDER: SlaRiskLevel[] = ['over_sla', 'risk', 'on_track']
const RISK_HEADING: Record<SlaRiskLevel, string> = {
  over_sla: '🔴 Order Over SLA',
  risk: '🟡 Order Risk SLA',
  on_track: '🟢 Order On Track',
}

function formatRemaining(hours: number): string {
  const abs = Math.abs(hours)
  const magnitude =
    abs >= 24
      ? `${(abs / 24).toLocaleString('id-ID', { maximumFractionDigits: 1 })} hari`
      : `${abs.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jam`
  return hours < 0 ? `Lewat ${magnitude}` : `Sisa ${magnitude}`
}

// Section 1 (Sprint I brief): get_sla_risk_orders() (Sprint H) grouped into
// its three existing risk_level buckets -- no re-derivation of the
// classification itself, just grouping + click-to-detail into the same
// OrderDetailModal the main Owner OS dashboard already uses.
export function PriorityTodaySection({
  orders,
  onSelectOrder,
}: {
  orders: SlaRiskOrder[]
  onSelectOrder: (orderId: string) => void
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Prioritas Hari Ini</h2>
        <p className="text-body text-secondary">Klik order untuk detail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {RISK_ORDER.map(level => {
          const bucket = orders.filter(o => o.risk_level === level)
          return (
            <div
              key={level}
              className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-outline-variant/80 flex items-center justify-between">
                <p className="text-body font-medium text-on-surface">{RISK_HEADING[level]}</p>
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
                        <p className="text-body text-secondary mt-0.5">{formatRemaining(order.hours_remaining)}</p>
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
