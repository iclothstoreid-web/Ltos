'use client'

interface FinalPreviewFooterProps {
  disabled: boolean
  onSkip: () => void
}

// Fase 2 (Final Preview) footer — deliberately just one action. "Generate
// Final Preview" already lives as AIPreviewPanel's own prominent "Buat
// Pratinjau Akhir" button (unchanged pipeline); this bar only adds the
// second choice the flow spec requires — skip AI generation entirely and
// move straight on to Consultation Review. Both paths converge on the same
// destination, handled by DesignStudioWorkspace (advanceToReview).
export function FinalPreviewFooter({ disabled, onSkip }: FinalPreviewFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 lg:h-24 bg-[#151c27] text-white z-50 flex items-center justify-between px-4 sm:px-8 lg:px-16 py-3 lg:py-0 gap-4">
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase text-[#858383] tracking-widest">Fase 2</span>
        <span className="font-sans text-sm truncate">Final Preview</span>
      </div>
      <button
        type="button"
        onClick={onSkip}
        disabled={disabled}
        className="px-4 sm:px-8 py-3 lg:py-4 bg-[#1c1b1b] border border-white/20 text-white font-sans text-xs sm:text-sm
                   uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-40"
      >
        Lewatkan
      </button>
    </footer>
  )
}
