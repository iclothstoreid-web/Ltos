import { memo } from 'react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/format/money'
import { STAGE_LABELS } from '@/lib/production/stageConfig'
import type { ProductionStage } from '@/lib/production/types'

type Signal = {
  key: 'komersial' | 'produksi' | 'inventaris'
  label: string
  detail: string
  href: string
}

// Sprint D.1 Phase 5 — Atmosphere DNA (Design Language Volume 02/03) locks
// this to exactly three quiet, unbordered signals; every number below is
// already computed server-side in src/app/command-center/page.tsx (no new
// query). "lihat ->" routes to each signal's own dedicated, already-existing
// page rather than opening anything new here.
// PR-01 (Rendering Performance) — memoized. Same API, same behavior.
function QuietLedgerComponent({
  commercial,
  bottleneck,
  inventory,
}: {
  commercial: { outstandingPayment: number; dpOutstandingCount: number; overdueCount: number }
  bottleneck: { stage: string | null; count: number | null; overSlaCount: number }
  inventory: {
    lowStockCount: number
    outOfStockCount: number
    mostCriticalItem: { name: string; available: number; unit: string } | null
  }
}) {
  // Behavior DNA (Volume 05, State) + Color DNA (Volume 02) — the alarm dot
  // is reserved for the one genuinely at-risk signal on the surface; when
  // more than one would independently qualify, only the most severe renders
  // red. Priority mirrors real consequence: a stock-out blocks production
  // outright, ahead of an order already past its promised date, ahead of a
  // payment that is merely outstanding.
  const atRiskKey: Signal['key'] | null =
    inventory.outOfStockCount > 0
      ? 'inventaris'
      : bottleneck.overSlaCount > 0
        ? 'produksi'
        : commercial.overdueCount > 0
          ? 'komersial'
          : null

  const stageLabel = bottleneck.stage
    ? STAGE_LABELS[bottleneck.stage as ProductionStage] || bottleneck.stage
    : null

  const signals: Signal[] = [
    {
      key: 'komersial',
      label: 'Komersial',
      detail:
        commercial.dpOutstandingCount > 0
          ? `DP tertunda: ${formatRupiah(commercial.outstandingPayment)} (${commercial.dpOutstandingCount} order)`
          : 'Tidak ada DP tertunda',
      href: '/command-center/commercial',
    },
    {
      key: 'produksi',
      label: 'Produksi',
      detail:
        stageLabel && (bottleneck.count ?? 0) > 0
          ? `Bottleneck di tahap ${stageLabel} (${bottleneck.count} order)`
          : 'Tidak ada bottleneck produksi',
      href: '/command-center/decision-center',
    },
    {
      key: 'inventaris',
      label: 'Inventaris',
      detail: inventory.mostCriticalItem
        ? `Stok bahan menipis: ${inventory.mostCriticalItem.name} (${inventory.mostCriticalItem.available.toLocaleString('id-ID')} ${inventory.mostCriticalItem.unit} tersisa)`
        : 'Stok bahan aman',
      href: '/inventory',
    },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10">
      {signals.map(signal => (
        <div key={signal.key} className="flex-1 min-w-0 flex items-start gap-2.5">
          <span className={`status-dot ${signal.key === atRiskKey ? 'critical' : 'normal'}`} />
          <div className="min-w-0">
            <p className="text-label text-secondary uppercase tracking-widest">{signal.label}</p>
            <p className="text-body text-on-surface mt-1.5 leading-relaxed">{signal.detail}</p>
            <Link
              href={signal.href}
              className="inline-block mt-1.5 text-label text-secondary/80 hover:text-on-surface transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
            >
              lihat →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export const QuietLedger = memo(QuietLedgerComponent)
