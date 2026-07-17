'use client'

interface ReviewFooterProps {
  customerName: string
  loading: boolean
  onContinue: () => void
}

// Stitch's floating footer "Continue" button and the Decision Panel's
// "Create Order" button represent the same intent shown twice in the
// reference — both wired to the same real order-creation action rather
// than inventing two different behaviors.
export function ReviewFooter({ customerName, loading, onContinue }: ReviewFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#151c27] text-white border-t border-white/10 backdrop-blur-md z-50">
      <div className="max-w-[1440px] mx-auto px-16 py-4 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="font-sans text-[10px] text-[#c8c6c5] uppercase opacity-70">Client</span>
            <span className="font-sans text-sm font-bold">{customerName}</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex flex-col">
            <span className="font-sans text-[10px] text-[#c8c6c5] uppercase opacity-70">
              Investment
            </span>
            <span className="font-sans text-sm font-bold text-[#e9c176]">Belum dihitung</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex flex-col">
            <span className="font-sans text-[10px] text-[#c8c6c5] uppercase opacity-70">Status</span>
            <span className="font-sans text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-[#775a19] rounded-full animate-pulse" />
              Draft Review
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={loading}
          className="bg-white text-[#151c27] px-8 py-2 font-sans text-sm uppercase tracking-widest
                     hover:bg-[#e5e2e1] transition-colors disabled:opacity-40"
        >
          {loading ? 'Memproses...' : 'Continue'}
        </button>
      </div>
    </footer>
  )
}
