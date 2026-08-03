'use client'

import { DIVISION_OPTIONS } from '@/lib/production/stageConfig'

interface DivisionSelectProps {
  value: string
  onChange: (division: string) => void
}

export function DivisionSelect({ value, onChange }: DivisionSelectProps) {
  return (
    <div>
      <label className="font-hanken text-[10px] uppercase tracking-widest text-secondary block mb-1">
        Divisi
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full py-2 bg-transparent border-b border-outline-variant focus:border-amber-mid
                   outline-none font-hanken text-sm text-on-surface transition-colors"
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
