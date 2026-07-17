'use client'

interface TopNavBarProps {
  fitterInitial: string
}

// Independent from the other frozen features' chrome components — no
// shared runtime dependency, same isolation convention as prior sprints.
export function TopNavBar({ fitterInitial }: TopNavBarProps) {
  return (
    <header className="flex justify-between items-center w-full px-16 py-4 bg-[#FDFCF8]/80 backdrop-blur-md sticky top-0 z-50 border-b-[0.5px] border-[#c4c7c7]">
      <div className="flex items-center gap-8">
        <span className="font-fraunces text-2xl font-bold text-[#151c27]">LTOS</span>
        <nav className="hidden md:flex gap-8">
          <span className="text-[#151c27] border-b border-[#151c27] pb-1 font-sans text-sm">
            Workspace
          </span>
          <span className="text-[#444748] font-sans text-sm">Activity</span>
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <span className="material-symbols-outlined text-[#444748]">notifications</span>
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#775a19] rounded-full" />
        </div>
        <span className="material-symbols-outlined text-[#444748]">settings</span>
        <div className="w-8 h-8 rounded-full bg-[#dce2f3] overflow-hidden border border-[#c4c7c7] flex items-center justify-center">
          <span className="font-fraunces text-xs text-[#151c27]">{fitterInitial}</span>
        </div>
      </div>
    </header>
  )
}
