'use client'

const NAV_ITEMS = [
  { label: 'Check-In', icon: 'person_add', active: false },
  { label: 'Studio', icon: 'architecture', active: true },
  { label: 'Persediaan', icon: 'straighten', active: false },
  { label: 'Pesanan', icon: 'description', active: false },
  { label: 'Analitik', icon: 'analytics', active: false },
]

// Visual-only nav placeholders (href="#") — same rationale as Check-In's
// sidebar: no Atelier/Inventory/Orders/Analytics pages exist, building them
// is out of scope, and this component is independent from Check-In's own.
export function MeasurementNavAside() {
  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 border-r-[0.5px] border-[#c4c7c7] bg-[#f9f9ff] hidden md:flex flex-col py-8">
      <div className="px-8 mb-16">
        <p className="font-sans text-xs uppercase tracking-widest text-[#444748]">Fitter App</p>
        <p className="font-sans text-sm font-bold text-[#151c27] mt-1">Local Tailor Operating System</p>
      </div>
      <div className="flex-1 space-y-2">
        {NAV_ITEMS.map(item => (
          <a
            key={item.label}
            href="#"
            aria-disabled={!item.active}
            onClick={e => {
              if (!item.active) e.preventDefault()
            }}
            className={`flex items-center px-8 py-3 gap-4 transition-all ${
              item.active
                ? 'text-[#151c27] bg-[#e2e8f8] border-l-4 border-[#775a19]'
                : 'text-[#444748] opacity-50 cursor-default'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-sans text-sm">{item.label}</span>
          </a>
        ))}
      </div>
      <div className="px-8 pt-8 border-t border-[#c4c7c7]">
        <a className="flex items-center gap-4 text-[#444748] hover:text-[#775a19] transition-colors" href="#">
          <span className="material-symbols-outlined">help_outline</span>
          <span className="font-sans text-xs">Bantuan</span>
        </a>
      </div>
    </aside>
  )
}
