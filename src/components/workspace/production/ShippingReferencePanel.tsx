'use client'

import type { StageRecord } from '@/lib/production/types'
import { COURIERS } from '@/lib/shipping/couriers'
import { DigitalHandoverCard } from './DigitalHandoverCard'

interface ShippingReferencePanelProps {
  stageRecords: StageRecord[]
  courier: string
  trackingNumber: string
  onCourierChange: (value: string) => void
  onTrackingNumberChange: (value: string) => void
}

// Pengiriman's "Data Acuan" — per the master prompt, read-only Ringkasan
// Packing + Evidence Packing + Catatan Packing. `DigitalHandoverCard`
// already renders exactly that shape (checklist, evidence photo, notes) for
// any completed stage record, so it's reused here against the latest
// completed Packing record instead of building a second read-only summary
// of the same data.
//
// Phase 2 "Shipping Experience" sprint additionally layers the real Data
// Pengiriman capture (Ekspedisi + Nomor Resi) here, since this is already
// the shipping-specific custom panel — captured before the completion scan,
// alongside Catatan Pengiriman, so operators fill it once before scanning.
export function ShippingReferencePanel({
  stageRecords,
  courier,
  trackingNumber,
  onCourierChange,
  onTrackingNumberChange,
}: ShippingReferencePanelProps) {
  const packingRecord = [...stageRecords]
    .filter(r => r.stage === 'packing' && r.status === 'completed')
    .sort((a, b) => b.attempt - a.attempt)[0]

  return (
    <div className="pb-6 border-b border-[#c6c6cc] space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
            Data Acuan Packing
          </p>
          <span className="font-hanken text-[9px] uppercase tracking-widest text-[#76777d] bg-[#efedf0] px-2 py-0.5 rounded">
            Hanya Baca
          </span>
        </div>
        {packingRecord ? (
          <DigitalHandoverCard record={packingRecord} />
        ) : (
          <p className="font-hanken text-xs text-[#46464c]">Belum ada data packing.</p>
        )}
      </div>

      <div>
        <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-3">
          Data Pengiriman
        </p>
        <div className="space-y-4">
          <div>
            <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-1">
              Ekspedisi
            </label>
            <select
              value={courier}
              onChange={e => onCourierChange(e.target.value)}
              className="w-full py-2 bg-transparent border-b border-[#c6c6cc] focus:border-[#755b00]
                         outline-none font-hanken text-sm text-[#161b29] transition-colors"
            >
              <option value="">Pilih ekspedisi</option>
              {COURIERS.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-1">
              Nomor Resi
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={e => onTrackingNumberChange(e.target.value)}
              placeholder="Masukkan nomor resi..."
              className="w-full border-b border-[#c6c6cc] bg-transparent py-2 font-hanken
                         text-sm text-[#161b29] outline-none focus:border-[#755b00] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
