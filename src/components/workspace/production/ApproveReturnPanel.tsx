'use client'

interface ApproveReturnPanelProps {
  nextStageLabel: string | null
  canApprove: boolean
  canReturn: boolean
  onApprove: () => void
  onReturn: () => void
  submitting: boolean
  returnLabel?: string
}

// Generic Setujui/Kembalikan decision for stages that need explicit
// approval to advance (Persiapan Material's Stitch export). "Kembalikan"
// reopens a new attempt of the same stage with the shared Catatan field as
// the required reason — see complete_stage's generalized "alter" branch.
// QC is the one exception: its "Kembalikan" sends Penjahitan back for a new
// attempt instead of reopening QC itself, so it passes a custom `returnLabel`.
export function ApproveReturnPanel({
  nextStageLabel,
  canApprove,
  canReturn,
  onApprove,
  onReturn,
  submitting,
  returnLabel = 'Kembalikan untuk Diperbaiki',
}: ApproveReturnPanelProps) {
  return (
    <div className="space-y-3 pt-2">
      <button
        type="button"
        onClick={onApprove}
        disabled={submitting || !canApprove}
        className="w-full bg-[#755b00] hover:bg-[#5f4a00] text-white font-hanken font-semibold py-4
                   rounded-2xl shadow-lg active:scale-[0.98] transition-all tracking-wide disabled:opacity-40"
      >
        {nextStageLabel ? `Setujui & Serahkan ke ${nextStageLabel}` : 'Setujui'}
      </button>
      <button
        type="button"
        onClick={onReturn}
        disabled={submitting || !canReturn}
        className="w-full bg-transparent border-2 border-[#161b29] text-[#161b29] font-hanken
                   font-semibold py-3.5 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-40"
      >
        {returnLabel}
      </button>
      {!canReturn && (
        <p className="font-hanken text-xs text-[#76777d] text-center">
          Isi Catatan terlebih dahulu untuk mengembalikan tahap ini.
        </p>
      )}
    </div>
  )
}
