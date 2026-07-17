'use client'

import { QRCodeSVG } from 'qrcode.react'
import { buildProductionQrPayload } from '@/lib/order/qr'

interface SystemLogisticsCardProps {
  orderId: string
  orderNumber: string
}

// Stitch shows all three as completed with checkmarks — that would be
// dishonest here: only the QR payload was actually generated. Inventory
// reservation and invoice sending are real, unbuilt integrations (per the
// brief: no dummy reservation), shown as pending instead of fabricated
// successes.
export function SystemLogisticsCard({ orderId, orderNumber }: SystemLogisticsCardProps) {
  const productionQrPayload = buildProductionQrPayload(orderId)
  const items = [
    { label: 'QR Tracking Payload Generated', done: true },
    { label: 'Inventory Reservation', done: false },
    { label: 'Automated Invoice', done: false },
  ]

  return (
    <section className="bg-white/50 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-4">
      <h3 className="font-sans text-xs text-[#444748] uppercase tracking-widest mb-4">
        System Logistics
      </h3>
      <div className="space-y-2 mb-4">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <span
              className={`material-symbols-outlined text-[16px] ${
                item.done ? 'text-[#151c27]' : 'text-[#c4c7c7]'
              }`}
            >
              {item.done ? 'check_circle' : 'pending'}
            </span>
            <span className="text-xs text-[#444748]">
              {item.label}
              {!item.done && ' — belum terhubung'}
            </span>
          </div>
        ))}
      </div>

      {/* Internal shop-floor QR — distinct from the customer tracking QR
          above. Encodes the exact same payload buildProductionQrPayload()
          always produced (no format change) — just rendered as a real,
          scannable image now instead of raw text. This is the QR Fitter
          prints and sticks on the hanger/order; scanning it is still the
          only way into the Production Packet (see production/page.tsx). */}
      <div className="pt-3 border-t border-[#c4c7c7]/40">
        <p className="text-[10px] uppercase tracking-widest text-[#444748] mb-2">
          QR Produksi
        </p>

        <div id="production-qr-print-area" className="flex flex-col items-center gap-2 py-3">
          <div className="bg-white p-3 border border-[#c4c7c7]/60">
            <QRCodeSVG value={productionQrPayload} size={160} level="M" />
          </div>
          <p className="font-sans text-xs text-[#151c27] font-bold tracking-widest">{orderNumber}</p>
        </div>

        <p className="font-mono text-[10px] text-[#444748] break-all mb-3">
          {productionQrPayload}
        </p>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#151c27] text-[#151c27]
                     font-sans text-xs uppercase tracking-widest hover:bg-[#151c27] hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">print</span>
          Cetak QR
        </button>

        <p className="text-[10px] text-[#444748] mt-2">
          QR resmi untuk ditempel Fitter pada hanger / order fisik.
        </p>
      </div>
    </section>
  )
}
