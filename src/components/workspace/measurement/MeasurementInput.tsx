'use client'

import type { MeasurementFields } from './types'

interface MeasurementInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  fieldKey?: keyof MeasurementFields
  onFocusField?: (key: keyof MeasurementFields | null) => void
  tooltip?: string
  step?: number
}

export function MeasurementInput({
  label,
  value,
  onChange,
  fieldKey,
  onFocusField,
  tooltip,
  step = 0.5,
}: MeasurementInputProps) {
  const adjust = (delta: number) => {
    const next = Math.max(0, (parseFloat(value) || 0) + delta)
    onChange(next.toString())
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-sans text-sm text-[#151c27]">{label}</span>
        {tooltip && (
          <span
            className="material-symbols-outlined text-[14px] text-[#c4c7c7] cursor-help"
            title={tooltip}
          >
            info
          </span>
        )}
      </div>
      <div className="flex items-center bg-[#f0f3ff] px-2 py-1 border border-[#c4c7c7]">
        <button
          type="button"
          onClick={() => adjust(-step)}
          className="px-2 text-[#747878] hover:text-[#151c27] transition-colors"
        >
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => onFocusField?.(fieldKey ?? null)}
          onBlur={() => onFocusField?.(null)}
          className="w-12 text-center bg-transparent border-none focus:ring-0 font-sans text-sm text-[#151c27] outline-none"
        />
        <button
          type="button"
          onClick={() => adjust(step)}
          className="px-2 text-[#747878] hover:text-[#151c27] transition-colors"
        >
          +
        </button>
        <span className="ml-2 text-xs text-[#444748]">cm</span>
      </div>
    </div>
  )
}
