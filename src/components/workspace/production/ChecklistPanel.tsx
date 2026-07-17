'use client'

interface ChecklistPanelProps {
  items: string[]
  checked: Record<string, boolean>
  onToggle: (item: string) => void
}

// Reused for QC's 10-item checklist and every other stage's single
// confirmation item, styled to match the newer slices' hex-literal system.
export function ChecklistPanel({ items, checked, onToggle }: ChecklistPanelProps) {
  return (
    <div>
      <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">
        Checklist
      </p>
      <div className="border-t border-[#c6c6cc]">
        {items.map(item => (
          <label
            key={item}
            className="flex items-center gap-3 py-3 border-b border-[#c6c6cc] cursor-pointer group"
          >
            <div
              className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors
                ${checked[item] ? 'bg-[#161b29] border-[#161b29]' : 'border-[#c6c6cc] group-hover:border-[#755b00]'}`}
            >
              {checked[item] && (
                <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={!!checked[item]}
              onChange={() => onToggle(item)}
              className="sr-only"
            />
            <span className={`font-hanken text-sm ${checked[item] ? 'text-[#161b29]' : 'text-[#46464c]'}`}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
