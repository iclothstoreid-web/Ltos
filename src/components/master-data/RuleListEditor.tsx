'use client'

interface RuleListEditorProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
}

// Generic Add/Edit/Delete/Reorder editor over a string[] — used for both
// AiDesignDna.lockRules and AiDesignDna.negativeRules (Reference-First
// Cleanup). Reorder mirrors MasterDataManager.tsx's existing up/down
// neighbor-swap pattern (handleMove) rather than inventing drag-and-drop;
// Add/Delete mirror the existing Selling Point row editor in the same file.
export function RuleListEditor({ label, items, onChange }: RuleListEditorProps) {
  function updateItem(index: number, value: string) {
    const next = [...items]
    next[index] = value
    onChange(next)
  }

  function addItem() {
    onChange([...items, ''])
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748]">{label}</p>
        <button
          type="button"
          onClick={addItem}
          className="text-xs uppercase tracking-widest text-[#775a19] hover:underline"
        >
          + Rule
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex flex-col shrink-0">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveItem(index, 'up')}
                className="material-symbols-outlined text-sm text-[#444748] disabled:opacity-20"
              >
                arrow_drop_up
              </button>
              <button
                type="button"
                disabled={index === items.length - 1}
                onClick={() => moveItem(index, 'down')}
                className="material-symbols-outlined text-sm text-[#444748] disabled:opacity-20 -mt-2"
              >
                arrow_drop_down
              </button>
            </div>
            <input
              value={item}
              onChange={e => updateItem(index, e.target.value)}
              className="flex-1 border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="material-symbols-outlined text-[#c0392b] text-lg"
            >
              close
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-[#444748]">Belum ada rule.</p>}
      </div>
    </div>
  )
}
