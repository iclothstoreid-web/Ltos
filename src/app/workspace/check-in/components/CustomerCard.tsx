'use client'

interface CustomerCardProps {
  name: string
  phone: string | null
  subtitle?: string | null
  badge?: 'PREFERRED' | null
  lastVisitLabel?: string
  selected?: boolean
  onClick?: () => void
}

export function CustomerCard({
  name,
  phone,
  subtitle,
  badge,
  lastVisitLabel,
  selected = false,
  onClick,
}: CustomerCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-xl bg-white border transition-all duration-300 cursor-pointer
        ${
          selected
            ? 'border-[#775a19]/20 shadow-[0_12px_24px_-10px_rgba(107,114,128,0.08)] scale-[1.02] border-l-4 border-l-[#775a19]'
            : 'border-transparent hover:bg-white/60 hover:border-[#c4c7c7]'
        }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-fraunces text-2xl text-[#151c27]">{name}</h4>
        {badge === 'PREFERRED' && (
          <span className="bg-[#fed488] text-[#785a1a] font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-widest uppercase">
            Preferred
          </span>
        )}
      </div>
      <p className="font-sans text-sm text-[#444748]">{phone || '—'}</p>
      {subtitle && (
        <p className="font-sans text-xs text-[#444748]/70 italic mt-1">{subtitle}</p>
      )}
      {lastVisitLabel && (
        <div className="mt-4 pt-4 border-t border-[#c4c7c7]/30 flex justify-between items-center">
          <span className="text-[11px] text-[#444748] uppercase tracking-tighter">
            {lastVisitLabel}
          </span>
          {badge === 'PREFERRED' && (
            <span
              className="material-symbols-outlined text-[#775a19] text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          )}
        </div>
      )}
    </button>
  )
}
