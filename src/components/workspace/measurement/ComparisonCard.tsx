'use client'

interface ComparisonCardProps {
  label: string
  current: string
  previous: number | null
}

// Compares against the real previously-saved measurement for this
// consultation (existingMeasurement, already fetched by the page) — no
// fabricated numbers.
export function ComparisonCard({ label, current, previous }: ComparisonCardProps) {
  const currentNum = parseFloat(current)
  const hasCurrent = !Number.isNaN(currentNum) && current !== ''
  const diff = hasCurrent && previous != null ? Math.round((currentNum - previous) * 10) / 10 : null

  if (previous == null) return null

  return (
    <div className="p-6 bg-[#775a19]/5 border-[0.5px] border-[#775a19]/20">
      <p className="font-sans text-xs uppercase tracking-widest text-[#775a19] mb-3">
        Perbandingan Sebelumnya
      </p>
      <div className="space-y-2">
        <p className="font-sans text-sm text-[#151c27]">
          <span className="font-bold">{label}:</span> {hasCurrent ? `${currentNum}cm` : '—'}
        </p>
        <div className="flex items-center gap-2 text-xs text-[#444748]">
          <span>Sebelumnya: {previous}cm</span>
          {diff !== null && (
            <>
              <span className="h-1 w-1 bg-[#c4c7c7] rounded-full" />
              <span className="text-[#775a19] font-bold">
                {diff > 0 ? '+' : ''}
                {diff}cm Selisih
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
