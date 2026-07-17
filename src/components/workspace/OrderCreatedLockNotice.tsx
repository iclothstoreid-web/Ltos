interface OrderCreatedLockNoticeProps {
  consultationNumber: string
  orderId: string | null
  stageLabel: string
}

// Shown instead of Measurement / Design Studio / Consultation Review once a
// consultation's Order has been created — those steps are frozen at that
// point (see createOrder.ts's duplicate-order guard for the write-side of
// this same rule). Read-only notice only; no new workspace or revision
// feature is built here, just the message pointing staff at the process.
export function OrderCreatedLockNotice({ consultationNumber, orderId, stageLabel }: OrderCreatedLockNoticeProps) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border-[0.5px] border-[#c4c7c7] shadow-sm p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-[#775a19] mb-4 inline-block">lock</span>
        <h1 className="font-fraunces text-2xl text-[#151c27] mb-3">Order Sudah Dibuat</h1>
        <p className="text-sm text-[#444748] leading-relaxed mb-2">
          Konsultasi <span className="font-bold text-[#151c27]">{consultationNumber}</span> sudah menghasilkan
          Order resmi.
        </p>
        <p className="text-sm text-[#444748] leading-relaxed mb-6">
          {stageLabel} untuk konsultasi ini tidak dapat diedit lagi. Perubahan data harus dilakukan melalui proses
          revisi Order, bukan dari workspace Fitter.
        </p>
        {orderId && (
          <a
            href={`/workspace/order-created/${orderId}`}
            className="inline-block px-6 py-3 bg-[#151c27] text-white text-sm uppercase tracking-widest
                       hover:bg-[#775a19] transition-colors"
          >
            Lihat Order
          </a>
        )}
      </div>
    </div>
  )
}
