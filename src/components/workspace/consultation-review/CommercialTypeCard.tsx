'use client'

import { COMMERCIAL_TYPES, requiresInvoice, type CommercialType } from '@/lib/commercial/commercialType'

interface CommercialTypeCardProps {
  value: CommercialType
  onChange: (value: CommercialType) => void
}

// Milestone A (Commercial Type Engine) — picked once here at Order
// Confirmation, carried into createOrderFromConsultation, and locked in on
// the new transactions row (no edit path after Create Order in this
// milestone). Normal/DP/Full Payment behave exactly like today (invoice +
// payment); the other four skip billing entirely while production/QC/
// delivery still run unchanged — see requiresInvoice().
export function CommercialTypeCard({ value, onChange }: CommercialTypeCardProps) {
  const selected = COMMERCIAL_TYPES.find(t => t.value === value)

  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7]">
      <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-3 text-[#151c27]">
        Tipe Komersial
      </h3>
      <select
        value={value}
        onChange={e => onChange(e.target.value as CommercialType)}
        className="w-full py-2 px-3 border border-[#c4c7c7] font-sans text-sm text-[#151c27] bg-white"
      >
        {COMMERCIAL_TYPES.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      {selected && !requiresInvoice(selected.value) && (
        <p className="mt-2 font-sans text-[10px] text-[#775a19] leading-relaxed">
          Order ini tidak akan menghasilkan invoice atau tagihan pembayaran. Produksi, QC, dan
          pengiriman tetap berjalan seperti biasa.
        </p>
      )}
    </section>
  )
}
