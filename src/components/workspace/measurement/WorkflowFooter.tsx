'use client'

interface WorkflowFooterProps {
  customerName: string
  sessionId: string
  filled: number
  total: number
  statusLabel: string
  primaryDisabled: boolean
  loading: boolean
  onContinue: () => void
  onRemeasure: () => void
}

// The Stitch reference's footer shows a single "Continue to Design Studio"
// CTA — but the existing (frozen) business logic also supports a
// "remeasure" decision, so that's kept as a smaller secondary action rather
// than dropped.
export function WorkflowFooter({
  customerName,
  sessionId,
  filled,
  total,
  statusLabel,
  primaryDisabled,
  loading,
  onContinue,
  onRemeasure,
}: WorkflowFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t-[0.5px] border-[#c4c7c7] px-4 sm:px-8 lg:px-16 py-4 lg:py-6">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 sm:gap-6 flex-wrap">
        <div className="flex items-center gap-16 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1c1b1b] text-[#858383] flex items-center justify-center rounded-sm shrink-0">
              <span className="font-fraunces text-lg">{customerName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-sans text-[10px] uppercase text-[#444748]">Pelanggan</p>
              <p className="font-sans text-sm font-bold text-[#151c27]">
                {customerName}, Sesi: {sessionId}
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 border-l border-[#c4c7c7] pl-16">
            <div>
              <p className="font-sans text-[10px] uppercase text-[#444748]">Progres</p>
              <p className="font-sans text-sm font-bold text-[#151c27]">
                {filled} / {total} Ukuran
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 border-l border-[#c4c7c7] pl-16">
            <div>
              <p className="font-sans text-[10px] uppercase text-[#444748]">Status</p>
              <p className="flex items-center gap-2 font-sans text-sm font-bold text-[#775a19]">
                <span className="w-2 h-2 bg-[#775a19] rounded-full animate-pulse" />
                {statusLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRemeasure}
            disabled={loading}
            className="font-sans text-xs text-[#444748] hover:text-[#151c27] uppercase tracking-widest
                       transition-colors disabled:opacity-40 px-4 py-2"
          >
            Perlu Diukur Ulang
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={primaryDisabled || loading}
            className="bg-[#151c27] text-white px-5 sm:px-8 lg:px-10 py-4 flex items-center gap-2 sm:gap-4 font-sans text-xs sm:text-sm
                       font-bold tracking-wider hover:bg-[#775a19] transition-all duration-300 group
                       disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? 'MENYIMPAN...' : 'LANJUT KE DESIGN STUDIO'}
            <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-2">
              arrow_right_alt
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
