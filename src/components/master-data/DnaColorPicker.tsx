'use client'

import { useEffect, useRef, useState } from 'react'
import type { DnaColor } from '@/lib/design/dnaColors'

interface DnaColorPickerProps {
  colors: DnaColor[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  accent?: string
  className?: string
}

// Shared visual DNA Color picker — every option renders its swatch + name
// (+ hex when available), never a plain text-only <option>. Reads only from
// `dna_colors` rows already fetched by the caller (fetchActiveDnaColors) —
// no schema/data change, this only replaces how existing options render.
export function DnaColorPicker({
  colors,
  value,
  onChange,
  placeholder = 'Pilih DNA Color',
  accent = '#775a19',
  className = '',
}: DnaColorPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = colors.find(c => c.id === value) ?? null

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(id: string) {
    onChange(id)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 py-1.5 px-2 border text-xs bg-white outline-none w-full text-left border-[#c4c7c7]"
        style={open ? { borderColor: accent } : undefined}
      >
        {selected ? (
          <>
            <span
              className="w-3.5 h-3.5 rounded-full border border-[#c4c7c7] shrink-0"
              style={{ backgroundColor: selected.hex || '#c4c7c7' }}
            />
            <span className="flex-1 truncate">{selected.name}</span>
            {selected.hex && (
              <span className="text-[10px] text-[#444748]/70 uppercase shrink-0">{selected.hex}</span>
            )}
          </>
        ) : (
          <span className="flex-1 text-[#444748]">{placeholder}</span>
        )}
        <span className="material-symbols-outlined text-sm text-[#444748] shrink-0">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-[220px] max-h-64 overflow-y-auto bg-white border border-[#c4c7c7] shadow-lg">
          {value && (
            <button
              type="button"
              onClick={() => handleSelect('')}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-[#444748] hover:bg-[#f9f9ff] border-b border-[#c4c7c7]/30"
            >
              Kosongkan pilihan
            </button>
          )}
          {colors.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[#444748]">Belum ada DNA Color aktif.</p>
          ) : (
            colors.map(color => (
              <button
                key={color.id}
                type="button"
                onClick={() => handleSelect(color.id)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-left text-xs hover:bg-[#f9f9ff] ${
                  color.id === value ? 'bg-[#f9f9ff]' : ''
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-[#c4c7c7] shrink-0"
                  style={{ backgroundColor: color.hex || '#c4c7c7' }}
                />
                <span className="flex-1 truncate">{color.name}</span>
                {color.hex && (
                  <span className="text-[10px] text-[#444748]/70 uppercase shrink-0">{color.hex}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
