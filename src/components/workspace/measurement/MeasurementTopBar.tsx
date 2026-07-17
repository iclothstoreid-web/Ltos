'use client'

// Deliberately independent from Check-In's chrome components (not imported
// from there) — Check-In is frozen this sprint and shouldn't gain a runtime
// dependency from Measurement.
export function MeasurementTopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCF8] border-b-[0.5px] border-[#c4c7c7] h-20 flex justify-between items-center px-16">
      <div className="flex items-center gap-8">
        <span className="font-caslon text-2xl tracking-tighter text-[#151c27]">LTOS</span>
        <div className="h-6 w-[0.5px] bg-[#c4c7c7]" />
        <nav className="hidden md:flex gap-8">
          <span className="font-sans text-sm text-[#444748]">Check-In</span>
          <span className="font-sans text-sm text-[#151c27] border-b-2 border-[#775a19] pb-1">
            Atelier
          </span>
          <span className="font-sans text-sm text-[#444748]">Inventory</span>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-[#444748] cursor-pointer">notifications</span>
        <span className="material-symbols-outlined text-[#444748] cursor-pointer">settings</span>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c4c7c7] bg-[#e2e8f8] flex items-center justify-center">
          <span className="font-fraunces text-sm text-[#151c27]">F</span>
        </div>
      </div>
    </header>
  )
}
