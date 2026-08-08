'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowUpRight, Search } from 'lucide-react'
import { LeftSidebar } from '@/components/command-center/OwnerCommandCenter/LeftSidebar'
import { OwnerTopBar } from '@/components/command-center/OwnerCommandCenter/OwnerTopBar'
import { KpiCard } from '@/components/command-center/OwnerCommandCenter/cards/KpiCard'

// PR-02 (Rendering Performance, Lazy Hydration) — only opened via local
// state (selectedOrderId), not part of first paint. Same component, same
// props; just excluded from the initial JS bundle until actually rendered.
const OrderDetailModal = dynamic(() =>
  import('@/components/command-center/OwnerCommandCenter/OrderDetailModal').then(mod => mod.OrderDetailModal)
)
import { formatRupiah } from '@/lib/format/money'
import { PAYMENT_STATUS_LABELS } from '@/lib/commercial/types'
import type { PaymentStatus } from '@/lib/commercial/types'
import type { OutstandingPaymentRow } from '@/lib/commercial/summary'

interface CommercialCenterProps {
  profileName: string
  sales: number
  cashCollected: number
  outstandingPayment: number
  dpOutstandingCount: number
  minDpPercent: number
  fullPaymentOnly: boolean
  outstandingRows: OutstandingPaymentRow[]
}

// Design Modernization (following Owner Decision Room) -- visual/composition
// only. Every figure below is still exactly what getCommercialSummary()
// (src/lib/commercial/summary.ts) already computed; no new query, RPC, or
// business rule. Badge colors reuse the existing status-dot/severity-dot
// hierarchy (Design Language Volume 02: warm-gold = attention short of
// alarm, primary green = settled/in-progress, error red reserved and never
// used per-row here) rather than inventing new color semantics. Sort/search
// are pure client-side operations over `outstandingRows`, the same prop
// this component already received -- no new data surface.
type SortKey = 'customerName' | 'orderNumber' | 'outstandingAmount' | 'agingDays'
type StatusFilter = 'all' | PaymentStatus

const SORT_LABEL: Record<SortKey, string> = {
  customerName: 'Customer',
  orderNumber: 'Order',
  outstandingAmount: 'Outstanding',
  agingDays: 'Umur',
}

// Volume 06 Badge & Status DNA: "one mark, reporting one real, specific
// condition" -- never the single-use alarm red repeated per row (Volume 02).
// belum_dibayar is the more attention-worthy of the two statuses that can
// actually appear in outstandingRows (outstanding > 0 by construction), so
// it reads as warm-gold ("attention"); dp_diterima already has money moving
// and reads as the calmer, settled-green tone. The other three PaymentStatus
// values never occur in this array but are covered for type-safety.
const STATUS_BADGE_CLASS: Record<PaymentStatus, string> = {
  belum_dibayar: 'bg-warm-gold/10 text-warm-gold border-warm-gold/20',
  dp_diterima: 'bg-primary/5 text-primary border-primary/10',
  lunas: 'bg-primary/5 text-primary border-primary/10',
  belum_ada_harga: 'bg-on-surface/5 text-secondary border-outline-variant/60',
  tidak_ada_tagihan: 'bg-on-surface/5 text-secondary border-outline-variant/60',
}

// Same aging-in-days calculation Command Center's page.tsx already uses for
// Payment Aging buckets (Sprint N.1 item 4) -- reused here, not reinvented.
function agingDays(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
}

function formatAging(days: number): string {
  return days <= 0 ? 'Hari ini' : `${days} hari`
}

// Owner-only commercial work queue. Every figure is calculated by the page
// from quotations/order_payments, with rule thresholds supplied by the
// existing Commercial Rules RPC.
export function CommercialCenter({
  profileName,
  sales,
  cashCollected,
  outstandingPayment,
  dpOutstandingCount,
  minDpPercent,
  fullPaymentOnly,
  outstandingRows,
}: CommercialCenterProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('agingDays')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const dpRuleLabel = fullPaymentOnly
    ? 'Full payment diwajibkan oleh Commercial Rules.'
    : minDpPercent > 0
      ? `Belum mencapai DP minimum ${minDpPercent}%.`
      : 'Tidak ada DP minimum aktif.'

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(dir => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'agingDays' || key === 'outstandingAmount' ? 'desc' : 'asc')
    }
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const withAging = outstandingRows.map(row => ({ row, aging: agingDays(row.createdAt) }))
    const filtered = withAging.filter(({ row }) => {
      if (statusFilter !== 'all' && row.paymentStatus !== statusFilter) return false
      if (!q) return true
      return row.customerName.toLowerCase().includes(q) || row.orderNumber.toLowerCase().includes(q)
    })
    return filtered.sort((a, b) => {
      let cmp: number
      switch (sortKey) {
        case 'customerName':
          cmp = a.row.customerName.localeCompare(b.row.customerName)
          break
        case 'orderNumber':
          cmp = a.row.orderNumber.localeCompare(b.row.orderNumber)
          break
        case 'outstandingAmount':
          cmp = a.row.outstandingAmount - b.row.outstandingAmount
          break
        case 'agingDays':
          cmp = a.aging - b.aging
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [outstandingRows, query, statusFilter, sortKey, sortDir])

  const isFiltered = query.trim().length > 0 || statusFilter !== 'all'

  return (
    <div className="min-h-screen bg-surface-01 text-text-primary flex atelier-bg">
      <LeftSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopBar profileName={profileName} onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-10 max-w-[1440px] w-full mx-auto space-y-10">
          <section>
            <p className="text-label text-secondary uppercase tracking-widest mb-3">Commercial Center</p>
            <h1 className="font-serif text-heading-md text-text-primary leading-[1.2] font-normal">Commercial Overview</h1>
            <p className="text-body-md text-secondary mt-3 leading-relaxed max-w-[58ch]">
              Nilai quotation, pembayaran yang diterima, dan pekerjaan pembayaran owner.
            </p>
            <div className="w-16 h-px bg-warm-gold mt-6" />
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <KpiCard label="Sales" value={sales} format="currency" />
            <KpiCard label="Cash Collected" value={cashCollected} format="currency" />
            <KpiCard label="Outstanding Payment" value={outstandingPayment} format="currency" />
            <KpiCard label="DP Outstanding" value={dpOutstandingCount} caption={dpRuleLabel} />
          </section>

          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Outstanding Payment</h2>
                <p className="text-body text-secondary mt-1">Klik baris untuk detail order</p>
              </div>
              <p className="text-body text-secondary shrink-0">
                {rows.length} {rows.length === outstandingRows.length ? 'order' : `dari ${outstandingRows.length} order`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-0 sm:max-w-[320px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Cari customer atau order..."
                  aria-label="Cari outstanding payment"
                  className="w-full border border-outline-variant/90 rounded-[14px] pl-9 pr-3 py-2.5 text-body text-on-surface placeholder:text-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-1.5 rounded-[14px] border border-outline-variant/90 p-1 w-fit">
                {(['all', 'belum_dibayar', 'dp_diterima'] as StatusFilter[]).map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`px-3 py-1.5 rounded-[10px] text-label uppercase tracking-widest transition-colors duration-200 ${
                      statusFilter === value
                        ? 'bg-on-surface text-surface'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    {value === 'all' ? 'Semua' : PAYMENT_STATUS_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 overflow-hidden elev-2">
              {rows.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <p className="text-title text-on-surface mb-2">
                    {outstandingRows.length === 0 ? 'Tidak ada pembayaran outstanding' : 'Tidak ada hasil'}
                  </p>
                  <p className="text-body text-secondary">
                    {outstandingRows.length === 0
                      ? 'Semua tagihan sudah lunas atau belum ada quotation aktif.'
                      : 'Tidak ada order yang cocok dengan pencarian/filter saat ini.'}
                  </p>
                  {isFiltered && outstandingRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('')
                        setStatusFilter('all')
                      }}
                      className="mt-4 text-label text-primary uppercase tracking-widest hover:text-on-surface transition-colors"
                    >
                      Reset pencarian
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr className="bg-on-surface/5 border-b border-outline-variant/80">
                        {(['customerName', 'orderNumber'] as SortKey[]).map(key => (
                          <th key={key} className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                            <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 hover:text-on-surface">
                              {SORT_LABEL[key]}
                              {sortKey === key && <span aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                            </button>
                          </th>
                        ))}
                        <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                          <button type="button" onClick={() => toggleSort('agingDays')} className="inline-flex items-center gap-1 hover:text-on-surface">
                            {SORT_LABEL.agingDays}
                            {sortKey === 'agingDays' && <span aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                          </button>
                        </th>
                        <th className="text-right px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                          <button type="button" onClick={() => toggleSort('outstandingAmount')} className="inline-flex items-center gap-1 hover:text-on-surface">
                            {SORT_LABEL.outstandingAmount}
                            {sortKey === 'outstandingAmount' && <span aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                          </button>
                        </th>
                        <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">Status</th>
                        <th className="px-5 py-3" aria-hidden="true" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {rows.map(({ row, aging }) => (
                        <tr
                          key={row.orderId}
                          onClick={() => setSelectedOrderId(row.orderId)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setSelectedOrderId(row.orderId)
                            }
                          }}
                          className="cursor-pointer transition-colors hover:bg-on-surface/5 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                        >
                          <td className="px-5 py-4 text-body font-medium text-on-surface whitespace-nowrap">{row.customerName}</td>
                          <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">{row.orderNumber}</td>
                          <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">{formatAging(aging)}</td>
                          <td className="px-5 py-4 text-body text-on-surface text-right tabular-nums whitespace-nowrap">
                            {formatRupiah(row.outstandingAmount)}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${STATUS_BADGE_CLASS[row.paymentStatus]}`}
                            >
                              {PAYMENT_STATUS_LABELS[row.paymentStatus]}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <ArrowUpRight size={15} className="inline text-secondary" aria-hidden="true" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {selectedOrderId && <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
    </div>
  )
}
