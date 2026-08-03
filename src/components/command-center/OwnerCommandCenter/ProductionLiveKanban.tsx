// Sprint N.1 (Owner Intelligence, item 1) — optional so every existing
// caller/column keeps working unchanged when it's absent.
type KanbanItem = { id: string; order: string; customer: string; estimatedCompletion?: string | null }

function formatEstimatedCompletion(iso: string | null | undefined): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ProductionLiveKanban({
  columns,
}: {
  columns: {
    waiting: KanbanItem[]
    cutting: KanbanItem[]
    sewing: KanbanItem[]
    qc: KanbanItem[]
    ready: KanbanItem[]
  }
}) {
  const columnList = [
    { key: 'waiting', label: 'Menunggu', items: columns.waiting },
    { key: 'cutting', label: 'Potong', items: columns.cutting },
    { key: 'sewing', label: 'Jahit', items: columns.sewing },
    { key: 'qc', label: 'QC', items: columns.qc },
    { key: 'ready', label: 'Siap', items: columns.ready },
  ] as const

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-widest">Monitoring Produksi</h2>
        <p className="text-body text-secondary">Kanban langsung</p>
      </div>

      <div className="rounded-[16px] border border-outline-variant/85 bg-surface/40 p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.14] bg-[repeating-linear-gradient(90deg,rgba(0,86,69,0.10)_0px,rgba(0,86,69,0.10)_1px,transparent_1px,transparent_80px)]" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {columnList.map(col => (
            <div key={col.key} className="space-y-2">
              <p className="text-label text-secondary uppercase tracking-widest">{col.label}</p>
              <div className="space-y-2">
                {col.items.length === 0 ? (
                  <p className="text-body text-secondary/70 text-sm">—</p>
                ) : (
                  col.items.map(it => (
                    <div
                      key={it.id}
                      className="rounded-lg border border-outline-variant/90 bg-surface/60 px-3 py-2 elev-1 transition-all duration-200 hover:bg-surface-low/70"
                    >
                      <p className="text-body font-medium text-on-surface truncate">{it.order}</p>
                      <p className="text-body text-secondary truncate">{it.customer}</p>
                      {formatEstimatedCompletion(it.estimatedCompletion) && (
                        <p className="text-label text-secondary/70 mt-0.5 truncate">
                          Estimasi: {formatEstimatedCompletion(it.estimatedCompletion)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

