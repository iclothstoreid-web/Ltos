'use client'

interface SingleSelectPanelProps<T extends string> {
  title: string
  options: { value: T; label: string }[]
  value: T | undefined
  onChange: (value: T) => void
}

// Single-select variant of BodyTagSelector's pill pattern — used by Cutting
// Model and Finishing Pergelangan, each of which allows exactly one active
// choice (unlike BodyTagSelector's multi-toggle body tags).
export function SingleSelectPanel<T extends string>({
  title,
  options,
  value,
  onChange,
}: SingleSelectPanelProps<T>) {
  return (
    <div>
      <label className="font-sans text-xs uppercase tracking-widest text-[#444748] block mb-2">
        {title}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-4 py-2 rounded-full font-sans text-sm transition-all border ${
                active
                  ? 'border-[#775a19] bg-[#775a19]/5 text-[#775a19]'
                  : 'border-[#c4c7c7] text-[#444748] hover:border-[#151c27] hover:text-[#151c27]'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
