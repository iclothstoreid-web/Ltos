'use client'

const NAV_ITEMS = [
  { label: 'Check-In', icon: 'person_add', active: true },
  { label: 'Studio', icon: 'architecture', active: false },
  { label: 'Persediaan', icon: 'straighten', active: false },
  { label: 'Order', icon: 'description', active: false },
  { label: 'Analitik', icon: 'analytics', active: false },
]

// Only "Check-In" is a live route this sprint — the rest are visual-only
// placeholders (no Atelier/Inventory/Orders/Analytics pages exist yet, and
// building them is explicitly out of scope), matching the Stitch reference's
// own `href="#"` placeholders.
export function CheckInSidebar() {
  return (
    <aside className="flex flex-col h-full py-8 bg-[#f9f9ff] border-r-[0.5px] border-[#c4c7c7] w-64 shrink-0">
      <div className="px-6 mb-10">
        <h1 className="font-fraunces text-2xl text-[#151c27] tracking-tight">LTOS</h1>
        <p className="text-[#444748] font-sans text-xs opacity-60 mt-1">Local Tailor Operating System</p>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(item => (
          <a
            key={item.label}
            href="#"
            aria-disabled={!item.active}
            onClick={e => {
              if (!item.active) e.preventDefault()
            }}
            className={`flex items-center px-6 py-4 transition-all duration-200 ${
              item.active
                ? 'text-[#151c27] bg-[#e2e8f8] border-l-4 border-[#775a19]'
                : 'text-[#444748] opacity-50 cursor-default'
            }`}
          >
            <span
              className="material-symbols-outlined mr-4"
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-sans text-sm">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="px-6 mt-auto">
        <a className="flex items-center py-4 text-[#444748] hover:text-[#775a19] transition-colors" href="#">
          <span className="material-symbols-outlined mr-4">help_outline</span>
          <span className="font-sans text-sm">Bantuan</span>
        </a>
      </div>
    </aside>
  )
}
