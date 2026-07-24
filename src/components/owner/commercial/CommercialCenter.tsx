'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { LeftSidebar } from '@/components/command-center/OwnerCommandCenter/LeftSidebar'
import { OrderDetailModal } from '@/components/command-center/OwnerCommandCenter/OrderDetailModal'
import { OwnerTopBar } from '@/components/command-center/OwnerCommandCenter/OwnerTopBar'
import { KpiCard } from '@/components/command-center/OwnerCommandCenter/cards/KpiCard'
import { formatRupiah } from '@/lib/format/money'
import { PAYMENT_STATUS_LABELS } from '@/lib/commercial/types'
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
  const dpRuleLabel = fullPaymentOnly
    ? 'Full payment diwajibkan oleh Commercial Rules.'
    : minDpPercent > 0
      ? `Belum mencapai DP minimum ${minDpPercent}%.`
      : 'Tidak ada DP minimum aktif.'

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
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <KpiCard label="Sales" value={sales} format="currency" />
            <KpiCard label="Cash Collected" value={cashCollected} format="currency" />
            <KpiCard label="Outstanding Payment" value={outstandingPayment} format="currency" />
            <KpiCard label="DP Outstanding" value={dpOutstandingCount} />
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Outstanding Payment</h2>
                <p className="text-body text-secondary mt-1">{dpRuleLabel}</p>
              </div>
              <p className="text-body text-secondary shrink-0">{outstandingRows.length} order</p>
            </div>

            <div className="rounded-[4px] border border-border-subtle bg-surface-01/40 overflow-hidden relative elev-2">
              <div className="overflow-x-auto">
                <div className="grid min-w-[720px] grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-on-surface/5 border-b border-outline-variant/80">
                  <span className="text-label text-secondary uppercase tracking-widest">Customer</span>
                  <span className="text-label text-secondary uppercase tracking-widest">Order</span>
                  <span className="text-label text-secondary uppercase tracking-widest text-right">Outstanding</span>
                  <span className="text-label text-secondary uppercase tracking-widest">Status</span>
                  <span className="text-label text-secondary uppercase tracking-widest">Detail</span>
                </div>

                {outstandingRows.length === 0 ? (
                  <p className="min-w-[720px] px-5 py-10 text-center text-body text-secondary">
                    Tidak ada pembayaran outstanding.
                  </p>
                ) : (
                  <ul className="min-w-[720px] divide-y divide-outline-variant">
                    {outstandingRows.map(row => (
                      <li key={row.orderId} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4">
                        <span className="text-body font-medium text-on-surface truncate">{row.customerName}</span>
                        <span className="text-body text-secondary truncate">{row.orderNumber}</span>
                        <span className="text-body text-on-surface text-right tabular-nums">{formatRupiah(row.outstandingAmount)}</span>
                        <span className="text-body text-secondary">{PAYMENT_STATUS_LABELS[row.paymentStatus]}</span>
                        <Link
                          href={`/command-center/commercial?orderId=${row.orderId}`}
                          onClick={event => {
                            event.preventDefault()
                            setSelectedOrderId(row.orderId)
                          }}
                          className="inline-flex items-center gap-1 text-body text-primary hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                        >
                          Detail <ArrowUpRight size={15} aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {selectedOrderId && <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
    </div>
  )
}
