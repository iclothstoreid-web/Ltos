// Local to KPI Operator (Sprint G) rather than reusing
// command-center/OwnerCommandCenter/cards/KpiCard.tsx -- that shared card
// only supports 'number'/'currency' formatting, and several stats here need
// a unit suffix (%, hari, jam, order). Extending KpiCard's contract would
// touch the main Owner OS dashboard's existing cards for no reason; a
// second small card (same visual language) avoids that risk entirely.
export function OperatorStatCard({
  label,
  value,
  suffix,
}: {
  label: string
  value: number | null
  suffix?: string
}) {
  const displayValue = value === null || value === undefined ? '—' : value.toLocaleString('id-ID')

  return (
    <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-6 py-5 elev-1 hover:-translate-y-[1px] transition-all duration-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.10] bg-[repeating-linear-gradient(135deg,rgba(27,27,28,0.10)_0px,rgba(27,27,28,0.10)_1px,transparent_1px,transparent_9px)]" />

      <p className="relative text-label text-secondary uppercase tracking-[0.24em]">{label}</p>
      <p className="relative font-serif text-title text-on-surface text-[28px] mt-2">
        {displayValue}
        {suffix && displayValue !== '—' && (
          <span className="font-sans text-body text-secondary ml-1">{suffix}</span>
        )}
      </p>
    </div>
  )
}
