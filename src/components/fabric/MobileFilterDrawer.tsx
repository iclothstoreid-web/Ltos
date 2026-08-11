'use client'

import { useState, type ReactNode } from 'react'

interface MobileFilterDrawerProps {
  children: ReactNode
  resultCount?: number
}

// The only client component in the Fabric Explorer filter UI — everything
// it renders as `children` (FabricFiltersPanel) is server-rendered by the
// parent page and passed straight through; this component owns nothing but
// open/closed UI state, no data fetching, no filter logic of its own.
// Desktop shows the same FabricFiltersPanel inline in a sidebar instead of
// through this wrapper.
export function MobileFilterDrawer({ children, resultCount }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-filter-drawer"
        className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/25 px-4 py-2 font-luxury-sans text-[11px] uppercase tracking-[0.14em] text-luxury-ivory transition hover:border-luxury-gold hover:text-luxury-gold focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
      >
        Filters
        {typeof resultCount === 'number' && <span className="text-luxury-taupe">({resultCount})</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
          }}
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-luxury-black/70"
          />
          <div
            id="mobile-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Fabric filters"
            className="relative ml-auto flex h-full w-[85vw] max-w-sm flex-col overflow-y-auto bg-luxury-navy-deep p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe hover:text-luxury-gold focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
              >
                Close
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      )}
    </div>
  )
}
