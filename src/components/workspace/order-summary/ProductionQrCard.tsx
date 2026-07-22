'use client'

import { useState } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { buildProductionQrPayload } from '@/lib/order/qr'

interface ProductionQrCardProps {
  orderId: string
  orderNumber: string
}

// "QR Production" section — Task 3 of the Shipping Experience sprint.
// Reuses the exact same payload buildProductionQrPayload() already produces
// for SystemLogisticsCard (Order Created) — never regenerated, per brief.
// This is purely a second, easy-to-reach place to pull the same QR back up
// for a rescan (Owner/Production/QC/Fitter), with a fullscreen/zoom view
// SystemLogisticsCard's inline card never had.
export function ProductionQrCard({ orderId, orderNumber }: ProductionQrCardProps) {
  const payload = buildProductionQrPayload(orderId)
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className="bg-[#fbf9fc] rounded-2xl p-6 shadow-sm border border-[#c6c6cc]/30 space-y-4">
      <h3 className="font-caslon text-xl text-[#161b29]">QR Production</h3>
      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="bg-white p-3 border border-[#c6c6cc]/60 rounded-lg"
          aria-label="Perbesar QR Production"
        >
          <QRCodeSVG value={payload} size={140} level="M" />
        </button>
        <p className="font-hanken text-xs font-bold tracking-widest text-[#161b29]">{orderNumber}</p>
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="font-hanken text-xs text-[#755b00] hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">zoom_in</span>
          Perbesar QR
        </button>
      </div>
      <p className="font-hanken text-[10px] text-[#76777d]">
        Scan untuk masuk ke Production Packet — dipakai ulang oleh Owner / Production / QC / Fitter.
      </p>

      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#fbf9fc] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
                QR Production &middot; {orderNumber}
              </p>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="material-symbols-outlined text-[#76777d] hover:text-[#161b29] transition-colors"
                aria-label="Tutup"
              >
                close
              </button>
            </div>
            <div className="flex justify-center bg-white p-4 border border-[#c6c6cc]/60 rounded-lg">
              <QRCodeCanvas
                value={payload}
                size={280}
                level="M"
                style={{ width: '100%', height: 'auto', maxWidth: '280px' }}
              />
            </div>
            <p className="font-hanken text-[10px] text-[#76777d] text-center break-all">{payload}</p>
          </div>
        </div>
      )}
    </div>
  )
}
