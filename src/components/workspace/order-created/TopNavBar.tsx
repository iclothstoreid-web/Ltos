'use client'

interface TopNavBarProps {
  fitterInitial: string
}

export function TopNavBar({ fitterInitial }: TopNavBarProps) {
  return (
    <header className="w-full sticky top-0 z-50 bg-[#f9f9ff]/80 backdrop-blur-md border-b-[0.5px] border-[#c4c7c7] px-16 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="font-fraunces text-xl text-[#151c27] tracking-tight">LTOS</h1>
        <span className="h-4 w-[1px] bg-[#c4c7c7]" />
        <p className="font-sans text-xs uppercase tracking-widest text-[#444748]">
          Konfirmasi Pesanan
        </p>
      </div>
      <div className="flex items-center gap-6">
        <button type="button" className="material-symbols-outlined text-[#444748] hover:text-[#151c27] transition-colors">
          notifications
        </button>
        <button type="button" className="material-symbols-outlined text-[#444748] hover:text-[#151c27] transition-colors">
          settings
        </button>
        <div className="w-10 h-10 rounded-full bg-[#e2e8f8] overflow-hidden border border-[#c4c7c7] flex items-center justify-center">
          <span className="font-fraunces text-sm text-[#151c27]">{fitterInitial}</span>
        </div>
      </div>
    </header>
  )
}
