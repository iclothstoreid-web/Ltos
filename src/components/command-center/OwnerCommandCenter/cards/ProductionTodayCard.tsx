export function ProductionTodayCard({ value }: { value: number }) {
  return (
    <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-6 py-5 elev-1 hover:-translate-y-[1px] transition-all duration-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.10] bg-[repeating-linear-gradient(135deg,rgba(27,27,28,0.10)_0px,rgba(27,27,28,0.10)_1px,transparent_1px,transparent_9px)]" />

      <p className="relative text-label text-secondary uppercase tracking-[0.24em]">Produksi Hari Ini</p>
      <p className="relative font-serif text-title text-on-surface text-[28px] mt-2">{value}</p>
    </div>
  )
}


