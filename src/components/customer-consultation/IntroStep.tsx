interface IntroStepProps {
  customerFirstName: string
  hasStarted: boolean
  onStart: () => void
}

export function IntroStep({ customerFirstName, hasStarted, onStart }: IntroStepProps) {
  return (
    <div className="space-y-6 text-center">
      <p className="text-xs uppercase tracking-widest text-[#775a19]">Selamat Datang</p>
      <h1 className="font-serif text-3xl">{customerFirstName}</h1>
      <p className="text-sm text-[#444748] leading-relaxed">
        Pilih model dan isi ukuran yang sudah Anda miliki. Data yang Anda kirim akan langsung masuk ke konsultasi
        Anda bersama tim Local Tailor.
      </p>
      <button
        onClick={onStart}
        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#151c27] text-white text-sm font-semibold uppercase tracking-widest hover:bg-[#151c27]/90 transition-colors"
      >
        {hasStarted ? 'Lanjutkan Mengisi' : 'Mulai Pilih Model'}
      </button>
    </div>
  )
}
