export function ExecutiveBriefing({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Ringkasan Eksekutif</h2>
        <p className="text-body text-secondary">Memo rahasia</p>
      </div>

      <div className="rounded-[18px] border border-outline-variant/85 bg-surface/50 px-6 py-6 elev-2 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.10] bg-[linear-gradient(135deg,rgba(200,155,60,0.30)_0%,rgba(0,86,69,0.12)_48%,rgba(252,250,248,0)_100%)]" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.18] bg-[repeating-linear-gradient(0deg,rgba(0,86,69,0.06)_0px,rgba(0,86,69,0.06)_1px,transparent_1px,transparent_26px)]" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-label text-secondary uppercase tracking-[0.22em]">Rekomendasi Eksekutif</p>
            <p className="font-serif text-on-surface text-[26px] leading-[1.2] mt-2 tracking-[-0.02em]">{title}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-label text-secondary uppercase tracking-[0.22em]">Owner OS</p>
            <p className="text-body text-secondary mt-1">Siap untuk pemilik</p>
          </div>
        </div>

        <p className="relative text-body text-secondary mt-4 leading-relaxed">{body}</p>

        <div className="relative mt-5 pt-4 border-t border-outline-variant/70">
          <p className="text-label text-secondary uppercase tracking-[0.22em]">Catatan keputusan</p>
          <p className="text-body text-secondary mt-2 leading-relaxed">
            Ambil tindakan seminimal mungkin. Lakukan langkah kecil paling menentukan untuk menstabilkan rantai kerja.
          </p>
        </div>
      </div>

    </section>
  )
}

