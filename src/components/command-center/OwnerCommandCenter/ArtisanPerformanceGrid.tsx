export function ArtisanPerformanceGrid({
  artisans,
}: {
  artisans: Array<{
    id: string
    name: string
    role: string
    workload: string
    capacity: string
    qualityScore: string
  }>
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-widest">Performa Artisan</h2>
        <p className="text-body text-secondary">Beban kerja, kapasitas, kualitas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {artisans.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-outline-variant bg-surface/40 px-5 py-4">
                <p className="text-label text-secondary uppercase tracking-widest">Belum ada data</p>
                <p className="text-body text-secondary mt-2">Data beban kerja artisan akan terhubung nanti.</p>
              </div>
            ))
          : artisans.map(a => (
              <div key={a.id} className="rounded-xl border border-outline-variant bg-surface/40 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-body font-medium text-on-surface">{a.name}</p>
                    <p className="text-body text-secondary mt-1">{a.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-label text-secondary uppercase tracking-widest">Kualitas</p>
                    <p className="font-serif text-title text-on-surface text-[22px] mt-1">{a.qualityScore}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-label text-secondary uppercase tracking-widest">Beban Kerja</p>
                    <p className="text-body text-secondary mt-1">{a.workload}</p>
                  </div>
                  <div>
                    <p className="text-label text-secondary uppercase tracking-widest">Kapasitas</p>
                    <p className="text-body text-secondary mt-1">{a.capacity}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </section>
  )
}

