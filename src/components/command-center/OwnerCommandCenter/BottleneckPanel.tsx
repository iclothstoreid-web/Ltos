import { ChevronRight } from 'lucide-react'
import { BOTTLENECK_SEVERITY_LABEL, BottleneckSeverity } from '@/lib/ltos'

export type BottleneckItem = {
  id: string
  severity: BottleneckSeverity
  customer: string
  order: string
  reason: string
  suggestedAction: string
  workspaceUrl: string
}

const SEVERITY_RANK: Record<BottleneckSeverity, number> = {
  kritis: 0,
  tinggi: 1,
  sedang: 2,
  rendah: 3,
}

const SEVERITY_BORDER: Record<BottleneckSeverity, string> = {
  kritis: 'border-l-error',
  tinggi: 'border-l-warm-gold',
  sedang: 'border-l-amber-mid',
  rendah: 'border-l-primary',
}

export function BottleneckPanel({ items }: { items: BottleneckItem[] }) {
  const sorted = [...items].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Panel Bottleneck</h2>
        <p className="text-body text-secondary">Prioritas tertinggi pemilik hari ini</p>
      </div>

      <div className="rounded-[4px] border border-border-subtle bg-surface-01/40 overflow-hidden relative elev-2">
        <div className="overflow-x-auto">
          <div className="relative grid grid-cols-12 gap-4 px-5 py-3 bg-on-surface/5 border-b border-outline-variant/80 min-w-[640px]">
            <div className="col-span-2 text-label text-secondary uppercase tracking-widest">Prioritas</div>
            <div className="col-span-3 text-label text-secondary uppercase tracking-widest">Customer</div>
            <div className="col-span-2 text-label text-secondary uppercase tracking-widest">Order</div>
            <div className="col-span-3 text-label text-secondary uppercase tracking-widest">Alasan</div>
            <div className="col-span-2 text-label text-secondary uppercase tracking-widest">Tindakan</div>
          </div>

          {sorted.length === 0 ? (
            <div className="relative px-5 py-10 text-center min-w-[640px]">
              <p className="text-title text-on-surface mb-2">Tidak ada bottleneck saat ini</p>
              <p className="text-body text-secondary">Semua order berjalan sesuai jadwal.</p>
            </div>
          ) : (
            <ul className="relative divide-y divide-outline-variant min-w-[640px]">
              {sorted.map((it, idx) => (
                <li
                  key={it.id}
                  className={`px-5 py-4 border-l-4 ${SEVERITY_BORDER[it.severity]} transition-colors`}
                >
                  <div className="group grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-2">
                      <p className="text-body text-on-surface font-medium">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}.
                      </p>
                      <p className="text-label text-secondary tracking-widest mt-1 whitespace-nowrap">
                        {BOTTLENECK_SEVERITY_LABEL[it.severity]}
                      </p>
                    </div>

                    <div className="col-span-3">
                      <p className="text-body font-medium text-on-surface truncate">{it.customer}</p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-body text-secondary truncate">{it.order}</p>
                    </div>

                    <div className="col-span-3">
                      <p className="text-body text-secondary truncate">{it.reason}</p>
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
      </div>
    </section>
  )
}
