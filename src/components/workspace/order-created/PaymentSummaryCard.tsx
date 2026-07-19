'use client'

// No pricing engine exists — honest placeholders instead of Stitch's fixed
// SAR figures, same policy as Design Studio / Consultation Review.
// "Not Collected" is kept as literal text since it's actually true (no
// payment integration exists, so nothing has been collected).
export function PaymentSummaryCard() {
  return (
    <section className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-4">
      <h3 className="font-sans text-xs text-[#444748] uppercase tracking-widest mb-4 border-b border-[#c4c7c7] pb-2">
        Ringkasan Pembayaran
      </h3>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between font-sans text-sm">
          <span className="text-[#444748]">Busana</span>
          <span className="text-[#151c27]">Belum dihitung</span>
        </div>
        <div className="flex justify-between font-sans text-sm">
          <span className="text-[#444748]">Aksesori &amp; Kustomisasi</span>
          <span className="text-[#151c27]">Belum dihitung</span>
        </div>
        <div className="h-[0.5px] bg-[#747878] border-dashed border-t-[0.5px]" />
        <div className="flex justify-between items-baseline pt-2">
          <span className="font-sans text-xs font-bold text-[#151c27]">TOTAL KESELURUHAN</span>
          <span className="font-fraunces text-lg text-[#151c27]">Belum dihitung</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#ba1a1a]">
          <span className="material-symbols-outlined text-[18px]">pending</span>
          <span className="font-sans text-xs uppercase">Status: Belum Diterima</span>
        </div>
        <div className="flex items-center gap-2 text-[#444748]">
          <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
          <span className="font-sans text-xs uppercase">Method: Belum tersedia</span>
        </div>
      </div>
    </section>
  )
}
