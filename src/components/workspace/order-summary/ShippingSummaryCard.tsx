'use client'

import type { StageRecord } from '@/lib/production/types'
import { courierLabel } from '@/lib/shipping/couriers'

interface ShippingSummaryCardProps {
  stageRecords: StageRecord[]
}

// "Shipping Information (jika sudah dikirim)" — Task 2/7. Reads the same
// courier/tracking_number Approve Shipping saves (see
// ShippingReferencePanel/set_shipping_info); shown only once a Shipping
// stage record actually exists, per the honesty rule the rest of this app
// already follows for not-yet-real data.
export function ShippingSummaryCard({ stageRecords }: ShippingSummaryCardProps) {
  const shippingRecord = [...stageRecords]
    .filter(r => r.stage === 'shipping')
    .sort((a, b) => b.attempt - a.attempt)[0]

  if (!shippingRecord) return null

  const isDone = shippingRecord.status === 'completed'

  return (
    <div className="bg-[#fbf9fc] rounded-2xl p-6 shadow-sm border border-[#c6c6cc]/30 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-caslon text-xl text-[#161b29]">Shipping</h3>
        <span
          className={`font-hanken text-[9px] uppercase tracking-widest px-2 py-0.5 rounded ${
            isDone ? 'bg-[#161b29]/10 text-[#161b29]' : 'bg-[#755b00]/10 text-[#755b00]'
          }`}
        >
          {isDone ? 'Terkirim' : 'Dalam Proses'}
        </span>
      </div>

      {shippingRecord.courier && shippingRecord.tracking_number ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 font-hanken text-sm text-[#161b29]">
          <div>
            <p className="font-hanken text-[10px] uppercase tracking-widest text-[#76777d] mb-1">Ekspedisi</p>
            <p>{courierLabel(shippingRecord.courier)}</p>
          </div>
          <div>
            <p className="font-hanken text-[10px] uppercase tracking-widest text-[#76777d] mb-1">Nomor Resi</p>
            <p>{shippingRecord.tracking_number}</p>
          </div>
        </div>
      ) : (
        <p className="font-hanken text-xs text-[#46464c]">Data pengiriman belum diisi.</p>
      )}
    </div>
  )
}
