'use client'

import { DIVISION_OPTIONS } from '@/lib/production/stageConfig'

interface DivisionSelectProps {
  value: string
  onChange: (division: string) => void
}

export function DivisionSelect({ value, onChange }: DivisionSelectProps) {
  return (
    <div>
      <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-1">
        Divisi
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full py-2 bg-transparent border-b border-[#c6c6cc] focus:border-[#755b00]
                   outline-none font-hanken text-sm text-[#161b29] transition-colors"
      >
        {DIVISION_OPTIONS.map(division => (
          <option key={division} value={division}>
            {division}
          </option>
        ))}
      </select>
    </div>
  )
}
