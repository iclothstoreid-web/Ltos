'use client'

interface CheckInHeaderProps {
  userInitial?: string
}

// Avatar is an initials placeholder rather than a hotlinked photo — the
// Stitch reference used external googleusercontent demo image URLs, which
// aren't appropriate to embed in a real production repo.
export function CheckInHeader({ userInitial = '?' }: CheckInHeaderProps) {
  return (
    <header className="h-20 flex justify-between items-center px-16 w-full border-b-[0.5px] border-[#c4c7c7] bg-[#f9f9ff] shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-sans text-xs uppercase tracking-widest text-[#444748]">Workspace</span>
        <span className="text-[#747878]">/</span>
        <span className="font-sans text-sm font-semibold text-[#151c27]">Client Intake</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="material-symbols-outlined text-[#444748] cursor-pointer hover:text-[#151c27] transition-colors">
          notifications
        </span>
        <span className="material-symbols-outlined text-[#444748] cursor-pointer hover:text-[#151c27] transition-colors">
          settings
        </span>
        <div className="w-10 h-10 rounded-full bg-[#e2e8f8] border border-[#c4c7c7] flex items-center justify-center">
          <span className="font-fraunces text-sm text-[#151c27]">{userInitial}</span>
        </div>
      </div>
    </header>
  )
}
