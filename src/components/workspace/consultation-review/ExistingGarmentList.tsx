'use client'

interface ExistingGarment {
  order_id: string
  order_number: string
  garment_index: number
  current_state: string
}

interface ExistingGarmentListProps {
  transactionNumber: string
  garments: ExistingGarment[]
}

export function ExistingGarmentList({ transactionNumber, garments }: ExistingGarmentListProps) {
  if (garments.length === 0) return null

  return (
    <div className="bg-[#f0f3ff]/50 border-l-2 border-[#775a19] p-4">
      <p className="font-sans text-xs font-bold text-[#775a19] uppercase tracking-widest mb-2">
        Transaksi Berjalan: {transactionNumber}
      </p>
      <p className="font-sans text-xs text-[#444748] mb-2">
        Menambahkan garmen baru ke transaksi yang sudah ada. Transaksi ini memiliki {garments.length} garmen:
      </p>
      <ul className="space-y-1">
        {garments.map((g) => (
          <li key={g.order_id} className="flex items-center gap-2">
            <span className="font-sans text-[10px] text-[#775a19] font-bold">
              #{g.garment_index}
            </span>
            <span className="font-sans text-xs text-[#151c27]">
              {g.order_number}
            </span>
            <span className="font-sans text-[10px] text-[#444748] uppercase">
              ({g.current_state})
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
