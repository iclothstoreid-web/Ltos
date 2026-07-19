// No production-time estimator exists in this repo (same honesty principle
// already established in TechnicalDetailsCard's "Belum dihitung") — an
// honest "will be informed" beats a fabricated date.
export function OrderStatusSection() {
  return (
    <section className="px-6 py-6 max-w-2xl mx-auto text-center border-y border-[#151c27]/10">
      <p className="font-fraunces text-xl text-on-surface mb-4">Pesanan Telah Dikonfirmasi</p>
      <p className="font-sans text-[10px] uppercase tracking-widest text-secondary mb-1">
        Estimasi Selesai
      </p>
      <p className="font-sans text-body text-secondary">Akan segera kami informasikan</p>
    </section>
  )
}
