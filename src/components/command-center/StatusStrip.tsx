interface StatusStripProps {
  critical: number
  high: number
  normal: number
}

export function StatusStrip({ critical, high, normal }: StatusStripProps) {
  const items = [
    { count: critical, label: 'terlambat', color: 'text-error', dot: 'bg-error' },
    { count: high, label: 'mendesak', color: 'text-warm-gold', dot: 'bg-warm-gold' },
    { count: normal, label: 'berjalan', color: 'text-secondary', dot: 'bg-secondary' },
  ].filter(item => item.count > 0)

  if (items.length === 0) {
    return (
      <p className="text-body text-secondary mt-3">
        ✓ Semua task dalam kondisi baik
      </p>
    )
  }

  return (
    <div className="flex items-center gap-6 mt-3 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${item.dot} ${item.count > 0 && item.dot === 'bg-error' ? 'animate-pulse-dot' : ''}`} />
          <span className={`text-body ${item.color}`}>
            <strong>{item.count}</strong> {item.label}
          </span>
        </span>
      ))}
    </div>
  )
}
