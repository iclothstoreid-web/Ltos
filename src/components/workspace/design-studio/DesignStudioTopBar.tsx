'use client'

import { useRouter } from 'next/navigation'

interface DesignStudioTopBarProps {
  sessionLabel: string
  canManageMasterData: boolean
}

// Independent from Check-In/Measurement's own top bars — each frozen
// feature keeps its chrome self-contained, no shared runtime dependency.
export function DesignStudioTopBar({ sessionLabel, canManageMasterData }: DesignStudioTopBarProps) {
  const router = useRouter()
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#f9f9ff]/80 backdrop-blur-md z-50 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-8 min-w-0">
        <span className="font-caslon text-lg sm:text-2xl tracking-tighter text-[#151c27] shrink-0">Fitter App</span>
        <div className="hidden sm:block h-6 w-[0.5px] bg-[#c4c7c7]" />
        <div className="hidden sm:flex flex-col min-w-0">
          <span className="font-sans text-[10px] text-[#444748] uppercase tracking-widest">
            Konteks Konsultasi
          </span>
          <span className="font-sans text-sm text-[#151c27] truncate">{sessionLabel}</span>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <span className="font-sans text-sm text-[#444748]">Ruang Kerja</span>
        <span className="font-sans text-sm text-[#151c27] border-b-2 border-[#775a19] pb-1">
          Bespoke Studio
        </span>
        <span className="font-sans text-sm text-[#444748]">Riwayat</span>
      </nav>
      <div className="flex items-center gap-2">
        {canManageMasterData && (
          <button
            type="button"
            onClick={() => router.push('/owner/master-data')}
            className="flex items-center gap-2 px-4 py-2 border-[0.5px] border-[#775a19] text-[#775a19]
                       font-sans text-xs uppercase tracking-widest hover:bg-[#775a19]/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Kelola Master Data
          </button>
        )}
        <button className="p-2 hover:bg-[#e7eefe] rounded-full transition-colors" type="button">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-[#dce2f3] overflow-hidden border border-[#c4c7c7] flex items-center justify-center">
          <span className="font-caslon text-sm text-[#151c27]">F</span>
        </div>
      </div>
    </header>
  )
}
