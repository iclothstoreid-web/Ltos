// Sprint N.1 (Owner Intelligence, item 1) — optional so every existing
// caller/column keeps working unchanged when it's absent.
type KanbanItem = { id: string; order: string; customer: string; estimatedCompletion?: string | null }

// Sprint D.1 Phase 5 — Atmosphere DNA (Design Language Volume 02 SS4, spec SS4):
// the Procession renders as a single flowing, hairline-connected sequence of
// stage + count, never boxed kanban cards. Per-order detail remains fully
// available at its own dedicated page (Decision Center); this Record-register
// surface only needs to be recognized at a glance, not searched.
const STAGES = [
  { key: 'waiting', label: 'Menunggu Penugasan' },
  { key: 'cutting', label: 'Cutting' },
  { key: 'sewing', label: 'Sewing' },
  { key: 'qc', label: 'QC' },
  { key: 'ready', label: 'Siap Kirim' },
] as const

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
  const stages = STAGES.map(stage => ({ ...stage, count: columns[stage.key].length }))

  return (
    <div className="flex flex-wrap items-start">
      {stages.map((stage, idx) => (
        <div key={stage.key} className="flex items-start">
          <div className="pr-6 sm:pr-10">
            <p className="text-label text-secondary uppercase tracking-widest">{stage.label}</p>
            <p className="font-sans text-on-surface text-[22px] font-medium mt-2 tabular-nums">{stage.count}</p>
          </div>
          {idx < stages.length - 1 && (
            <div className="w-6 sm:w-10 h-px bg-outline-variant mt-[22px] mr-6 sm:mr-10" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  )
}
