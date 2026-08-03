'use client'

interface QcDecisionPanelProps {
  // Kategori Temuan options — Return Rules (Business Rules), fetched once
  // server-side via get_return_rules() and passed down through
  // ProductionPacketWorkspace. Formerly hardcoded to QC_CHECKLIST_ITEMS;
  // the Return Rules default seeds those same 5 items.
  returnReasons: string[]
  uncheckedItems: string[]
  alterCategory: string
  onAlterCategoryChange: (category: string) => void
}

// "Jika gagal, QC memilih ALTER, lalu mengisi Kategori Temuan + Catatan +
// Evidence" — Catatan/Evidence are the generic notes/evidence fields already
// on the stage shell. The Setujui/Kembalikan decision itself is made via the
// two AKHIR buttons (ApproveReturnPanel), so this panel only needs to
// capture the finding category ahead of "Kembalikan ke Penjahitan".
export function QcDecisionPanel({
  returnReasons,
  uncheckedItems,
  alterCategory,
  onAlterCategoryChange,
}: QcDecisionPanelProps) {
  return (
    <div className="pt-4 border-t border-outline-variant">
      <label className="font-hanken text-[10px] uppercase tracking-widest text-secondary block mb-1">
        Kategori Temuan
      </label>
      <select
        value={alterCategory}
        onChange={e => onAlterCategoryChange(e.target.value)}
        className="w-full py-2 bg-transparent border-b border-outline-variant focus:border-amber-mid
                   outline-none font-hanken text-sm text-on-surface transition-colors"
      >
        <option value="">Pilih kategori...</option>
        {returnReasons.map(item => (
          <option key={item} value={item}>
            {item}
            {uncheckedItems.includes(item) ? ' (belum sesuai)' : ''}
          </option>
        ))}
      </select>
      <p className="font-hanken text-xs text-secondary/80 mt-1">
        Wajib diisi jika mengembalikan tahap ini ke Penjahitan.
      </p>
    </div>
  )
}
