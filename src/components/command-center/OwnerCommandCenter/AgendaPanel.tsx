export type AgendaItem = {
  id: string
  type: 'Janji Temu' | 'Konsultasi' | 'Fitting' | 'Review Produksi' | 'Pengiriman'
  customer: string
  label: string
}

export function AgendaPanel({ items }: { items: AgendaItem[] }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface/40 p-5">
      <h2 className="text-label text-secondary uppercase tracking-widest">Agenda Hari Ini</h2>

      {items.length === 0 ? (
        <p className="text-body text-secondary mt-4 leading-relaxed">
          Tidak ada agenda yang perlu diselesaikan hari ini.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map(item => (
            <li key={item.id} className="flex items-start justify-between gap-4 border-b border-outline-variant/60 pb-3 last:border-b-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-body font-medium text-on-surface truncate">{item.customer}</p>
                <p className="text-body text-secondary truncate">{item.label}</p>
              </div>
              <span className="shrink-0 text-label text-secondary/80 uppercase tracking-widest">
                {item.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
