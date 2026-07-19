'use client'

interface DecisionPanelProps {
  loading: boolean
  onCreateOrder: () => void
  onApprove: () => void
}

// "Save Consultation" is this screen's "Approve Consultation" action per the
// brief's required action list — same button already present in Stitch,
// wired to a real approval event rather than inventing a new button.
export function DecisionPanel({ loading, onCreateOrder, onApprove }: DecisionPanelProps) {
  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onCreateOrder}
        disabled={loading}
        className="w-full py-3 bg-[#151c27] text-white font-sans text-sm uppercase tracking-widest
                   hover:bg-[#775a19] transition-all duration-300 disabled:opacity-40"
      >
        {loading ? 'Memproses...' : 'Buat Pesanan'}
      </button>
      <button
        type="button"
        onClick={onApprove}
        disabled={loading}
        className="w-full py-3 border-[0.5px] border-[#151c27] text-[#151c27] font-sans text-sm
                   uppercase tracking-widest hover:bg-[#f0f3ff] transition-all duration-300 disabled:opacity-40"
      >
        Simpan Konsultasi
      </button>
      <div className="bg-[#f0f3ff]/50 p-3 border-l-2 border-[#775a19]">
        {/* Stitch's original copy claims inventory reservation and payment
            QR generation — neither exists in this repo, so the note
            describes what Create Order actually does instead of promising
            unbuilt capability. */}
        <p className="font-sans text-xs italic text-[#444748] leading-tight">
          &quot;Buat Pesanan akan membuat order resmi dari konsultasi ini dan melanjutkan workflow
          ke tahap produksi (belum diimplementasikan). Reservasi inventory dan QR pembayaran belum
          tersedia.&quot;
        </p>
      </div>
    </section>
  )
}
