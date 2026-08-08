'use client'

import { memo } from 'react'

interface ChecklistPanelProps {
  items: string[]
  checked: Record<string, boolean>
  onToggle: (item: string) => void
}

// Reused for QC's 10-item checklist and every other stage's single
// confirmation item.
//
// PR-03 (Rendering Performance) — memoized. Effective once the caller
// stabilizes `onToggle` via useCallback (see ProductionPacketWorkspace.tsx).
// Same API, same behavior.
function ChecklistPanelComponent({ items, checked, onToggle }: ChecklistPanelProps) {
  return (
    <div>
      <p className="font-hanken text-[10px] uppercase tracking-widest text-secondary mb-2">
        Checklist
      </p>
      <div className="border-t border-outline-variant">
        {items.map(item => (
          <label
            key={item}
            className="flex items-center gap-3 py-3 border-b border-outline-variant cursor-pointer group"
          >
            <div
              className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors
                ${checked[item] ? 'bg-on-surface border-on-surface' : 'border-outline-variant group-hover:border-amber-mid'}`}
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
            <span className={`font-hanken text-sm ${checked[item] ? 'text-on-surface' : 'text-secondary'}`}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export const ChecklistPanel = memo(ChecklistPanelComponent)
