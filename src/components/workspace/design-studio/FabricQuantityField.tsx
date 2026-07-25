'use client'

interface FabricQuantityFieldProps {
  value: number | null
  onChange: (value: number | null) => void
}

// The single manual input that finally gives reserveInventory() a real
// quantityMeters (Sprint V1.2.1) instead of the hardcoded null every order
// carried before. Deliberately a plain number the Fitter types in — no
// calculator/formula derives it from measurements, per this sprint's
// LARANGAN.
export function FabricQuantityField({ value, onChange }: FabricQuantityFieldProps) {
  return (
    <div className="mt-3">
      <label className="block font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1">
        Kebutuhan Kain (meter)
      </label>
      <input
        type="number"
        min={0}
        step={0.1}
        value={value ?? ''}
        onChange={e => {
          const raw = e.target.value
          onChange(raw === '' ? null : Number(raw))
        }}
        placeholder="Contoh: 2.8"
        className="w-full p-3 font-sans text-sm text-[#151c27] border border-[#c4c7c7]/60 focus:border-[#775a19]/60 outline-none bg-white"
      />
    </div>
  )
}
