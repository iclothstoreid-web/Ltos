export function RightTimelinePanel({
  timeline,
}: {
  timeline: {
    appointments: number
    consultations: number
    fittings: number
    productionReview: number
    delivery: number
  }
}) {
  return (
    <section className="sticky top-[84px]">
      <div className="rounded-xl border border-outline-variant bg-surface/40 p-5">
        <h2 className="text-label text-secondary uppercase tracking-widest">Linimasa Hari Ini</h2>
        <div className="mt-4 space-y-3">
          {[
            ['Janji Temu', timeline.appointments],
            ['Konsultasi', timeline.consultations],
            ['Fitting', timeline.fittings],
            ['Review Produksi', timeline.productionReview],
            ['Pengiriman', timeline.delivery],
          ].map(([label, count]) => (
            <div key={label as string} className="flex items-center justify-between gap-4">
              <p className="text-body text-secondary">{label}</p>
              <p className="font-serif text-title text-on-surface text-[20px]">{count}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-outline-variant pt-4">
          <p className="text-body text-secondary leading-relaxed">
            Ringkasan hari Anda — hanya langkah yang memerlukan koordinasi.
          </p>
        </div>
      </div>
    </section>
  )
}

