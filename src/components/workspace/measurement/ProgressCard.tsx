'use client'

interface ProgressCardProps {
  filled: number
  total: number
}

export function ProgressCard({ filled, total }: ProgressCardProps) {
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100)
  const circumference = 2 * Math.PI * 44
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="p-6 bg-white border-[0.5px] border-[#c4c7c7] shadow-sm flex flex-col items-center">
      <div className="relative w-24 h-24 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            className="text-[#e2e8f8]"
            cx="48"
            cy="48"
            r="44"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
          />
          <circle
            className="text-[#775a19]"
            cx="48"
            cy="48"
            r="44"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 250ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-sans text-sm font-bold text-[#151c27]">{pct}%</span>
        </div>
      </div>
      <p className="font-sans text-sm text-[#151c27]">
        {pct === 100 ? 'Pengukuran Selesai' : `${filled} dari ${total} Terisi`}
      </p>
      <p className="text-[10px] uppercase text-[#444748] mt-1">
        {pct === 100 ? 'Siap untuk pembuatan pola' : 'Sedang berlangsung'}
      </p>
    </div>
  )
}
