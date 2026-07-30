'use client'

import { useState } from 'react'
import { formatRupiah } from '@/lib/format/money'
import type { CommercialTypeSummaryRow } from '@/lib/commercial/transactionSummary'

interface CommercialTypeSummarySectionProps {
  rows: CommercialTypeSummaryRow[]
  onSelectOrder: (orderId: string) => void
}

// Milestone A (Commercial Type Engine) — Owner Dashboard drill-down: click a
// type card to list its transactions, click a transaction to open the same
// OrderDetailModal every other dashboard panel already uses. Never merged
// into the existing Revenue KPI (SummaryCards) — `revenue` here is
// additive-only reporting, see transactionSummary.ts.
export function CommercialTypeSummarySection({ rows, onSelectOrder }: CommercialTypeSummarySectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const selected = rows.find(r => r.type === selectedType) || null

  return (
    <section className="mb-10">
      <div className="mb-6">
        <h2 className="font-serif text-heading-sm text-text-primary leading-[1.2] font-normal">
          Commercial Summary
        </h2>
        <p className="text-body-md text-secondary mt-2 leading-relaxed max-w-[60ch]">
          Setiap order diklasifikasikan menurut Tipe Komersial. KOL/Sponsor/Garansi/Sample Internal tidak
          menghasilkan tagihan, tetapi tetap berjalan penuh di Produksi, QC, dan Pengiriman.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {rows.map(row => (
          <button
            key={row.type}
            type="button"
            onClick={() => setSelectedType(prev => (prev === row.type ? null : row.type))}
            className={`text-left rounded-[14px] border px-5 py-4 transition-colors elev-1 ${
              selectedType === row.type
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant/85 bg-surface/45 hover:bg-on-surface/5'
            }`}
          >
            <p className="text-label text-secondary uppercase tracking-[0.2em]">{row.label}</p>
            <p className="font-serif text-title text-[28px] leading-none text-on-surface mt-2 tabular-nums">
              {row.transactionCount}
            </p>
            <p className="text-label text-secondary mt-1">
              {row.garmentCount} garmen · {row.completedGarmentCount} selesai
            </p>
            <div className="mt-3 pt-3 border-t border-outline-variant/60 space-y-0.5">
              <p className="text-label text-secondary">
                Estimasi Nilai <span className="text-on-surface tabular-nums">{formatRupiah(row.estimatedValue)}</span>
              </p>
              {row.requiresInvoice && (
                <p className="text-label text-secondary">
                  Revenue <span className="text-on-surface tabular-nums">{formatRupiah(row.revenue)}</span>
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-4 rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/80">
            <p className="text-body font-medium text-on-surface">{selected.label} — Transaksi</p>
          </div>
          {selected.transactions.length === 0 ? (
            <p className="px-6 py-4 text-label text-secondary">Belum ada transaksi.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {selected.transactions.map(t => (
                <li key={t.transactionId}>
                  <button
                    type="button"
                    disabled={!t.orderId}
                    onClick={() => t.orderId && onSelectOrder(t.orderId)}
                    className="w-full text-left px-6 py-3 hover:bg-on-surface/5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-body font-medium text-on-surface truncate">
                        {t.orderNumber || t.transactionNumber} · {t.customerName || 'Customer'}
                      </span>
                      <span className="text-label text-secondary shrink-0">
                        {t.completed ? 'Selesai' : 'Berjalan'}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
