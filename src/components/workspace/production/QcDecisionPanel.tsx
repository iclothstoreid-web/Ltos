'use client'

import { QC_CHECKLIST_ITEMS } from '@/lib/production/stageConfig'

interface QcDecisionPanelProps {
  uncheckedItems: string[]
  alterCategory: string
  onAlterCategoryChange: (category: string) => void
}

// "Jika gagal, QC memilih ALTER, lalu mengisi Kategori Temuan + Catatan +
// Evidence" — Catatan/Evidence are the generic notes/evidence fields already
// on the stage shell; Kategori Temuan suggests the checklist items left
// unchecked (no separate taxonomy invented). The Setujui/Kembalikan decision
// itself is made via the two AKHIR buttons (ApproveReturnPanel), so this
// panel only needs to capture the finding category ahead of "Kembalikan ke
// Penjahitan".
export function QcDecisionPanel({
  uncheckedItems,
  alterCategory,
  onAlterCategoryChange,
}: QcDecisionPanelProps) {
  return (
    <div className="pt-4 border-t border-[#c6c6cc]">
      <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-1">
        Kategori Temuan
      </label>
      <select
        value={alterCategory}
        onChange={e => onAlterCategoryChange(e.target.value)}
        className="w-full py-2 bg-transparent border-b border-[#c6c6cc] focus:border-[#755b00]
                   outline-none font-hanken text-sm text-[#161b29] transition-colors"
      >
        <option value="">Pilih kategori...</option>
        {QC_CHECKLIST_ITEMS.map(item => (
          <option key={item} value={item}>
            {item}
            {uncheckedItems.includes(item) ? ' (belum sesuai)' : ''}
          </option>
        ))}
      </select>
      <p className="font-hanken text-xs text-[#76777d] mt-1">
        Wajib diisi jika mengembalikan tahap ini ke Penjahitan.
      </p>
    </div>
  )
}
