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
    <div className="fixed inset-x-0 bottom-0 lg:absolute lg:bottom-10 lg:left-1/2 lg:-translate-x-1/2 w-full lg:max-w-4xl px-4 pb-4 lg:px-16 lg:pb-0 pointer-events-none z-40">
      <div className="bg-[#151c27]/95 backdrop-blur-md text-white rounded-2xl lg:rounded-full px-4 py-3 lg:px-8 lg:py-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 lg:gap-4 shadow-[0_12px_24px_-10px_rgba(107,114,128,0.08)] pointer-events-auto border border-white/10">
        <div className="flex items-center gap-4 lg:gap-10 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="font-fraunces text-xs">{customerName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="font-sans opacity-50 uppercase text-[9px] tracking-widest">Pelanggan</p>
              <p className="font-sans text-sm font-semibold truncate">{customerName}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 shrink-0 hidden sm:block" />
          <div className="hidden sm:block">
            <p className="font-sans opacity-50 uppercase text-[9px] tracking-widest">Sesi</p>
            <p className="font-sans text-sm font-semibold">{sessionLabel}</p>
          </div>
          <div className="h-8 w-px bg-white/10 shrink-0 hidden sm:block" />
          <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
            <span className="w-2 h-2 rounded-full bg-[#e9c176] animate-pulse" />
            <p className="font-sans text-sm font-semibold">{statusLabel}</p>
          </div>
        </div>
        <button
          onClick={onPrimaryAction}
          disabled={primaryDisabled}
          className="w-full lg:w-auto bg-white text-[#151c27] px-8 py-3 rounded-full font-sans text-sm font-bold
                     hover:bg-[#775a19] hover:text-white transition-all duration-300 min-h-[44px]
                     flex items-center justify-center lg:justify-start gap-2 group disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
