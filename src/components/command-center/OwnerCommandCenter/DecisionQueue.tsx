import { ChevronRight } from 'lucide-react'

export function DecisionQueue({
  items,
}: {
  items: Array<{
    id: string
    priority: 'critical' | 'high' | 'normal' | 'ready'
    customer: string
    order: string
    reason: string
    suggestedAction: string
    workspaceUrl: string
  }>
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Antrian Keputusan</h2>
        <p className="text-body text-secondary">Kotak masuk pemilik hari ini</p>
      </div>

      <div className="rounded-[4px] border border-border-subtle bg-surface-01/40 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.16]" />


        <div className="relative grid grid-cols-12 gap-4 px-5 py-3 bg-on-surface/5 border-b border-outline-variant/80">
          <div className="col-span-2 text-label text-secondary uppercase tracking-widest">Prioritas</div>
          <div className="col-span-3 text-label text-secondary uppercase tracking-widest">Customer</div>
          <div className="col-span-2 text-label text-secondary uppercase tracking-widest">Order</div>
          <div className="col-span-3 text-label text-secondary uppercase tracking-widest">Alasan</div>
          <div className="col-span-2 text-label text-secondary uppercase tracking-widest">Tindakan</div>
        </div>

        {items.length === 0 ? (
          <div className="relative px-5 py-10 text-center">
            <p className="text-title text-on-surface mb-2">Tidak ada keputusan yang diperlukan</p>
            <p className="text-body text-secondary">Antrian Anda kosong.</p>
          </div>
        ) : (
          <ul className="relative divide-y divide-outline-variant">
            {items.map((it, idx) => (
              <li
                key={it.id}
                className="px-5 py-4 transition-colors"
              >
                <div className="group grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-2">
                    <p className="text-body text-on-surface font-medium">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}.
                    </p>
                    <p className="text-label text-secondary uppercase tracking-widest mt-1">{it.priority}</p>
                  </div>

                  <div className="col-span-3">
                    <p className="text-body font-medium text-on-surface truncate">{it.customer}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-body text-secondary">{it.order}</p>
                  </div>

                  <div className="col-span-3">
                    <p className="text-body text-secondary">{it.reason}</p>
                  </div>

                  <div className="col-span-2">
                    <a
                      href={it.workspaceUrl}
                      className="inline-flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg border border-outline-variant/90 bg-surface/10 text-body text-on-surface transition-all duration-200 hover:bg-on-surface/5 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                    >
                      <span className="truncate">{it.suggestedAction}</span>
                      <ChevronRight size={16} className="text-secondary transition-transform duration-200 group-hover:translate-x-[1px]" />
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

