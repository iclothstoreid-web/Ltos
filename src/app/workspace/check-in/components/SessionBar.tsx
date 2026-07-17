'use client'

interface SessionBarProps {
  customerName: string
  sessionLabel: string
  statusLabel: string
  primaryLabel: string
  onPrimaryAction: () => void
  primaryDisabled?: boolean
}

export function SessionBar({
  customerName,
  sessionLabel,
  statusLabel,
  primaryLabel,
  onPrimaryAction,
  primaryDisabled = false,
}: SessionBarProps) {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-16 pointer-events-none">
      <div className="bg-[#151c27]/95 backdrop-blur-md text-white rounded-full px-8 py-4 flex justify-between items-center shadow-[0_12px_24px_-10px_rgba(107,114,128,0.08)] pointer-events-auto border border-white/10">
        <div className="flex items-center gap-10 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="font-fraunces text-xs">{customerName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="font-sans opacity-50 uppercase text-[9px] tracking-widest">Customer</p>
              <p className="font-sans text-sm font-semibold truncate">{customerName}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 shrink-0" />
          <div className="hidden sm:block">
            <p className="font-sans opacity-50 uppercase text-[9px] tracking-widest">Session</p>
            <p className="font-sans text-sm font-semibold">{sessionLabel}</p>
          </div>
          <div className="h-8 w-px bg-white/10 shrink-0 hidden sm:block" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#e9c176] animate-pulse" />
            <p className="font-sans text-sm font-semibold">{statusLabel}</p>
          </div>
        </div>
        <button
          onClick={onPrimaryAction}
          disabled={primaryDisabled}
          className="bg-white text-[#151c27] px-8 py-3 rounded-full font-sans text-sm font-bold
                     hover:bg-[#775a19] hover:text-white transition-all duration-300
                     flex items-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {primaryLabel}
          <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  )
}
