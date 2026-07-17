'use client'

import { useState } from 'react'

interface AccordionProps {
  index: number
  title: string
  defaultOpen?: boolean
  children?: React.ReactNode
}

// Independent from Measurement's accordion component (not imported from
// there) — Measurement is frozen this sprint and shouldn't gain a runtime
// dependency from Design Studio.
export function Accordion({ index, title, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-[#c4c7c7]/30 pb-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center py-2 text-left"
      >
        <span className="font-sans text-sm text-[#151c27] uppercase tracking-widest">
          {index}. {title}
        </span>
        <span
          className="material-symbols-outlined transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>
      {open && children && <div className="pt-4">{children}</div>}
    </div>
  )
}
