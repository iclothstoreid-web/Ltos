interface SuccessStepProps {
  consultationNumber: string
  onBackToSummary: () => void
}

export function SuccessStep({ consultationNumber, onBackToSummary }: SuccessStepProps) {
  return (
    <div className="space-y-6 text-center">
      <p className="text-xs uppercase tracking-widest text-[#2e7d32]">Berhasil</p>
      <h1 className="font-serif text-2xl">Data berhasil dikirim ke Local Tailor</h1>
      <p className="text-sm text-[#444748] leading-relaxed">
        Nomor konsultasi Anda: <span className="font-semibold text-[#151c27]">{consultationNumber}</span>
        <br />
        Tim fitter kami akan memeriksa desain dan ukuran yang Anda pilih, lalu menghubungi Anda kembali bila
        diperlukan.
      </p>
      <button
        onClick={onBackToSummary}
        className="px-8 py-3 rounded-lg bg-[#151c27] text-white text-sm font-semibold uppercase tracking-widest hover:bg-[#151c27]/90 transition-colors"
      >
        Kembali ke Ringkasan
      </button>
      <p className="text-xs text-[#444748]">Link ini bisa dibuka kembali kapan saja untuk melihat atau melanjutkan pengisian.</p>
    </div>
  )
}
