'use client'

interface CustomerSummaryCardProps {
  customerName: string
  customerId: string
  isPreferred: boolean
  sessionNumber: string
  fitterName: string
}

// Real customer id / session number / fitter name — Stitch's reference
// shows fixed placeholder values ("#CST-8821", "Elias") for these; all
// replaced with the actual data already collected in prior sprints.
export function CustomerSummaryCard({
  customerName,
  customerId,
  isPreferred,
  sessionNumber,
  fitterName,
}: CustomerSummaryCardProps) {
  return (
    <section className="bg-white shadow-sm p-4 border-[0.5px] border-[#c4c7c7]">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-fraunces text-xl text-[#151c27] truncate">{customerName}</h2>
          {isPreferred && (
            <span className="bg-[#fed488]/30 text-[#785a1a] px-2 py-0.5 font-sans text-[10px] uppercase tracking-tighter shrink-0">
              Prioritas
            </span>
          )}
        </div>
        <p className="font-sans text-xs text-[#444748]">ID: #{customerId.slice(0, 8).toUpperCase()}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-[#c4c7c7]/30 space-y-2">
        <div className="flex justify-between font-sans text-xs">
          <span className="text-[#444748]">Sesi</span>
          <span className="text-[#151c27]">{sessionNumber}</span>
        </div>
        <div className="flex justify-between font-sans text-xs">
          <span className="text-[#444748]">Fitter</span>
          <span className="text-[#151c27]">{fitterName}</span>
        </div>
      </div>
    </section>
  )
}
