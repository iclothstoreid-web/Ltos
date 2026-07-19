'use client'

import type { EstimasiPengerjaan } from './fitterEnhancementsCodec'

const OPTIONS: EstimasiPengerjaan[] = ['Standard', 'Fast', 'Very Fast']

interface EstimationCardProps {
  value: EstimasiPengerjaan
  onChange: (value: EstimasiPengerjaan) => void
  saving: boolean
}

export function EstimationCard({ value, onChange, saving }: EstimationCardProps) {
  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7]">
      <h3 className="font-sans text-xs text-[#151c27] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">schedule</span>
        Estimasi Pengerjaan
      </h3>
      <select
        value={value}
        disabled={saving}
        onChange={e => onChange(e.target.value as EstimasiPengerjaan)}
        className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19] disabled:opacity-60"
      >
        <option value="">Pilih estimasi</option>
        {OPTIONS.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </section>
  )
}
