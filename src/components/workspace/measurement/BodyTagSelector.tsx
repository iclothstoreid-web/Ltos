'use client'

import { BODY_TAGS } from './types'

interface BodyTagSelectorProps {
  selected: string[]
  onToggle: (tag: string) => void
}

export function BodyTagSelector({ selected, onToggle }: BodyTagSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {BODY_TAGS.map(tag => {
        const active = selected.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`px-4 py-2 rounded-full font-sans text-sm transition-all border ${
              active
                ? 'border-[#775a19] bg-[#775a19]/5 text-[#775a19]'
                : 'border-[#c4c7c7] text-[#444748] hover:border-[#151c27] hover:text-[#151c27]'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
