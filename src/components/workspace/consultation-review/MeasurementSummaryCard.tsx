'use client'

import { useRouter } from 'next/navigation'

interface MeasurementSummaryCardProps {
  consultationId: string
  filledCount: number
  totalCount: number
  bodyTags: string[]
}

export function MeasurementSummaryCard({
  consultationId,
  filledCount,
  totalCount,
  bodyTags,
}: MeasurementSummaryCardProps) {
  const router = useRouter()

  return (
    <section className="bg-white shadow-sm p-4 border-[0.5px] border-[#c4c7c7]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans text-xs text-[#151c27] font-bold uppercase tracking-widest">
          Pengukuran
        </h3>
        <span className="text-[#775a19] font-sans text-xs">
          {filledCount}/{totalCount} LENGKAP
        </span>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="w-1/3 aspect-[3/4] bg-[#e7eefe] border border-[#c4c7c7] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#747878]">photo_camera</span>
        </div>
        <div className="w-1/3 aspect-[3/4] bg-[#e7eefe] border border-[#c4c7c7] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#747878]">accessibility_new</span>
        </div>
        <div className="w-1/3 aspect-[3/4] bg-[#e7eefe] border border-[#c4c7c7] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#747878]">straighten</span>
        </div>
      </div>

      {bodyTags.length > 0 && (
        <div className="mb-4">
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">
            Karakter Bentuk Tubuh
          </p>
          <div className="flex flex-wrap gap-1.5">
            {bodyTags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#775a19]/5 border border-[#775a19]/20 text-[#775a19] text-[10px] font-sans"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => router.push(`/workspace/measurement/${consultationId}`)}
          className="w-full py-3 border-[0.5px] border-[#747878] hover:bg-[#f0f3ff] transition-all duration-300 font-sans text-xs text-[#151c27]"
        >
          Lihat / Edit Pengukuran
        </button>
        <button
          type="button"
          disabled
          title="Dokumentasi foto belum tersimpan permanen (hanya pratinjau lokal di tahap Pengukuran)"
          className="w-full py-3 border-[0.5px] border-[#c4c7c7] font-sans text-xs text-[#444748] opacity-50 cursor-not-allowed"
        >
          Lihat Foto
        </button>
      </div>
    </section>
  )
}
