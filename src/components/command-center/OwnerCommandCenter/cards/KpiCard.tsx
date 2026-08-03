export function KpiCard({
  label,
  value,
  format = 'number',
  caption,
}: {
  label: string
  value: number | null | undefined
  format?: 'number' | 'currency'
  // Optional supporting fact directly under the figure (e.g. the rule that
  // explains it) — additive/backward-compatible, every existing caller
  // renders exactly as before when omitted.
  caption?: string
}) {
  const safeValue = value ?? 0
  const displayValue =
    format === 'currency'
      ? `Rp ${safeValue.toLocaleString('id-ID')}`
      : safeValue.toLocaleString('id-ID')

  return (
    <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-6 py-5 elev-1 hover:-translate-y-[1px] transition-all duration-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.10] bg-[repeating-linear-gradient(135deg,rgba(27,27,28,0.10)_0px,rgba(27,27,28,0.10)_1px,transparent_1px,transparent_9px)]" />

      <p className="relative text-label text-secondary uppercase tracking-[0.24em]">{label}</p>
      <p className="relative font-serif text-title text-on-surface text-[28px] mt-2">{displayValue}</p>
      {caption && <p className="relative text-body text-secondary/80 mt-1.5 leading-snug">{caption}</p>}
    </div>
  )
}
