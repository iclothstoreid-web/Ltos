'use client'

// No pricing engine exists (quotations table has no computation logic
// anywhere in this repo) — clear "not yet calculated" placeholders instead
// of Stitch's fixed "SAR 3,450.00" figures, per the brief's own instruction
// not to invent dummy numbers. Payment buttons are visual-only; there's no
// payment backend in this repo, and building one is out of scope for a
// review screen.
export function PriceSummaryCard() {
  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-[100px]">payments</span>
      </div>
      <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-[#151c27]">
        Ringkasan
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-end pb-2 border-b-[0.5px] border-[#c4c7c7]/20">
          <span className="text-[#444748] font-sans text-xs">Subtotal</span>
          <span className="font-sans text-sm text-[#151c27]">Belum dihitung</span>
        </div>
        <div className="flex justify-between items-end pb-2 border-b-[0.5px] border-[#c4c7c7]/20">
          <span className="text-[#444748] font-sans text-xs">Aksesori</span>
          <span className="font-sans text-sm text-[#151c27]">Belum dihitung</span>
        </div>
        <div className="flex justify-between items-end pt-2">
          <span className="font-sans text-xs font-bold text-[#151c27]">Total Akhir</span>
          <span className="font-fraunces text-xl text-[#151c27] font-bold">Belum dihitung</span>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-[#c4c7c7]/30">
        <p className="font-sans text-[10px] uppercase text-[#444748] mb-3">
          Status Pembayaran: <span className="text-[#ba1a1a] font-bold italic">Belum Diterima</span>
        </p>
        <div className="flex gap-2">
          {['Tunai', 'Transfer', 'QRIS'].map(method => (
            <button
              key={method}
              type="button"
              disabled
              title="Pengumpulan pembayaran belum terhubung ke backend"
              className="flex-1 py-2 border border-[#747878] text-[10px] uppercase tracking-tighter opacity-50 cursor-not-allowed"
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
