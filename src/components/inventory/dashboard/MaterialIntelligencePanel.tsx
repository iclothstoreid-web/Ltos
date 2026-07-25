import Link from 'next/link'
import { AlertOctagon, Flame, TrendingDown, TrendingUp } from 'lucide-react'
import type { MaterialAttentionItem, MaterialUsageRanking } from '@/lib/inventory/types'

// Sprint I.1 Material Intelligence — reuses fetchMaterials()/materialStockStatus()
// data already loaded for the Dashboard, plus the two new pure/aggregation
// helpers in src/lib/inventory/materials.ts. No new table, RPC, or page:
// this panel lives inside the existing Inventory Dashboard.

function IntelligenceCard({
  icon: Icon,
  iconClass,
  title,
  children,
}: {
  icon: typeof AlertOctagon
  iconClass: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface/45 border border-outline-variant/60 rounded-[2rem] p-6 elev-1">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon size={16} />
        </div>
        <h4 className="font-serif text-body font-bold text-on-surface">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function AttentionRow({ item }: { item: MaterialAttentionItem }) {
  const badgeClass =
    item.status === 'habis' ? 'bg-error/10 text-error border-error/10' : 'bg-warm-gold/10 text-warm-gold border-warm-gold/20'

  return (
    <Link
      href={`/inventory/material?material=${item.materialId}`}
      className="flex items-center justify-between gap-3 py-2.5 px-3 -mx-3 rounded-xl hover:bg-surface-container transition-colors"
    >
      <div className="min-w-0">
        <p className="text-body font-medium text-on-surface truncate">{item.name}</p>
        <p className="text-label text-secondary/70 mt-0.5">
          {item.availableStock.toLocaleString('id-ID')} / {item.minStock.toLocaleString('id-ID')} {item.unit}
        </p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${badgeClass}`}>
        {item.status === 'habis' ? 'Habis' : 'Menipis'}
      </span>
    </Link>
  )
}

function UsageRow({ item, rank }: { item: MaterialUsageRanking; rank: number }) {
  return (
    <Link
      href={`/inventory/material?q=${encodeURIComponent(item.name)}`}
      className="flex items-center justify-between gap-3 py-2.5 px-3 -mx-3 rounded-xl hover:bg-surface-container transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-label font-bold text-secondary/50 w-4 shrink-0">{rank}</span>
        <p className="text-body font-medium text-on-surface truncate">{item.name}</p>
      </div>
      <span className="text-label font-bold text-on-surface shrink-0">
        {item.totalConsumed.toLocaleString('id-ID')} {item.unit}
      </span>
    </Link>
  )
}

export function MaterialIntelligencePanel({
  attentionList,
  mostUsedMaterials,
}: {
  attentionList: MaterialAttentionItem[]
  mostUsedMaterials: MaterialUsageRanking[]
}) {
  const kritis = attentionList.filter(i => i.status === 'habis')
  const menipis = attentionList.filter(i => i.status === 'menipis')

  return (
    <div>
      <h3 className="font-serif text-title text-on-surface mb-4">Material Intelligence</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IntelligenceCard icon={AlertOctagon} iconClass="bg-error/10 text-error" title="Material Kritis">
          {kritis.length === 0 ? (
            <p className="text-label text-secondary">Tidak ada material kritis.</p>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {kritis.map(item => (
                <AttentionRow key={item.materialId} item={item} />
              ))}
            </div>
          )}
        </IntelligenceCard>

        <IntelligenceCard icon={TrendingDown} iconClass="bg-warm-gold/10 text-warm-gold" title="Material Hampir Habis">
          {menipis.length === 0 ? (
            <p className="text-label text-secondary">Tidak ada material menipis.</p>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {menipis.map(item => (
                <AttentionRow key={item.materialId} item={item} />
              ))}
            </div>
          )}
        </IntelligenceCard>

        <IntelligenceCard icon={Flame} iconClass="bg-primary/10 text-primary" title="Material Paling Banyak Dipakai">
          {mostUsedMaterials.length === 0 ? (
            <p className="text-label text-secondary">Belum ada riwayat pemakaian.</p>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {mostUsedMaterials.map((item, i) => (
                <UsageRow key={item.materialId} item={item} rank={i + 1} />
              ))}
            </div>
          )}
        </IntelligenceCard>

        <IntelligenceCard icon={TrendingUp} iconClass="bg-secondary/10 text-secondary" title="Perlu Perhatian">
          {attentionList.length === 0 ? (
            <p className="text-label text-secondary">Tidak ada material yang perlu ditinjau.</p>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {attentionList.map(item => (
                <Link
                  key={item.materialId}
                  href={`/inventory/material?material=${item.materialId}`}
                  className="flex items-center justify-between gap-3 py-2.5 px-3 -mx-3 rounded-xl hover:bg-surface-container transition-colors"
                >
                  <p className="text-body font-medium text-on-surface truncate">{item.name}</p>
                  <span className="text-label font-bold text-primary shrink-0">
                    Beli +{item.reorderQty.toLocaleString('id-ID')} {item.unit}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </IntelligenceCard>
      </div>
    </div>
  )
}
