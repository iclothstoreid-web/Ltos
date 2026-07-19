// Same visual shape as command-center/OwnerCommandCenter/cards/KpiCard.tsx
// (kept local instead of imported since that one lives inside the
// command-center feature folder, not a shared component location).
function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-6 py-5 elev-1 hover:-translate-y-[1px] transition-all duration-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.10] bg-[repeating-linear-gradient(135deg,rgba(27,27,28,0.10)_0px,rgba(27,27,28,0.10)_1px,transparent_1px,transparent_9px)]" />
      <p className="relative text-label text-secondary uppercase tracking-[0.24em]">{label}</p>
      <p className="relative font-serif text-title text-on-surface text-[28px] mt-2">{value.toLocaleString('id-ID')}</p>
    </div>
  )
}

export function SummaryCards({
  totalMaterial,
  totalItem,
  stokMenipis,
  reservedMaterial,
}: {
  totalMaterial: number
  totalItem: number
  stokMenipis: number
  reservedMaterial: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <SummaryCard label="Total Material" value={totalMaterial} />
      <SummaryCard label="Total Item Unik" value={totalItem} />
      <SummaryCard label="Stok Menipis" value={stokMenipis} />
      <SummaryCard label="Material Reserved" value={reservedMaterial} />
    </div>
  )
}
