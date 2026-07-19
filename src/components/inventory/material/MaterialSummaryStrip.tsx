// Small ambient summary for the Material Workspace — deliberately much
// smaller than dashboard/SummaryCards.tsx's KPI tiles, since this page is
// meant to feel like a workspace to act in, not a dashboard to read.
function StripStat({ label, value, unit, tone }: { label: string; value: number; unit?: string; tone?: 'warn' | 'default' }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-label text-secondary/70 uppercase tracking-widest">{label}</span>
      <span className={`text-body font-bold ${tone === 'warn' ? 'text-warm-gold' : 'text-on-surface'}`}>
        {value.toLocaleString('id-ID')}
        {unit ? <span className="text-label font-normal text-secondary/60"> {unit}</span> : null}
      </span>
    </div>
  )
}

export function MaterialSummaryStrip({
  totalMaterial,
  totalItem,
  lowStock,
  reservedMaterial,
}: {
  totalMaterial: number
  totalItem: number
  lowStock: number
  reservedMaterial: number
}) {
  return (
    <div className="flex items-center gap-6 flex-wrap px-5 py-3 mb-6 rounded-xl border border-outline-variant/40 bg-surface-container-low/60">
      <StripStat label="Total Material" value={totalMaterial} unit="kategori" />
      <span className="w-px h-4 bg-outline-variant/50" />
      <StripStat label="Total Item" value={totalItem} unit="item" />
      <span className="w-px h-4 bg-outline-variant/50" />
      <StripStat label="Low Stock" value={lowStock} unit="item" tone={lowStock > 0 ? 'warn' : 'default'} />
      <span className="w-px h-4 bg-outline-variant/50" />
      <StripStat label="Reserved Material" value={reservedMaterial} unit="unit" />
    </div>
  )
}
