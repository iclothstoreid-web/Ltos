'use client'

import { useState } from 'react'

interface MeasurementAccordionProps {
  title: string
  filled: number
  total: number
  defaultOpen?: boolean
  children: React.ReactNode
}

export function MeasurementAccordion({
  title,
  filled,
  total,
  defaultOpen = false,
  children,
}: MeasurementAccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-[#c4c7c7] pb-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center text-left py-2"
      >
        <span className="font-sans text-sm font-bold text-[#151c27]">
          {title.toUpperCase()}{' '}
          <span className="ml-2 font-normal text-[#444748] text-xs">
            ({filled}/{total})
          </span>
        </span>
        <span
          className="material-symbols-outlined text-sm transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>
      {open && <div className="pt-4 space-y-6">{children}</div>}
    </div>
  )
}
