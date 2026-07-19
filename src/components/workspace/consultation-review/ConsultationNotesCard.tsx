'use client'

interface ConsultationNotesCardProps {
  notes: string
}

export function ConsultationNotesCard({ notes }: ConsultationNotesCardProps) {
  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7]">
      <h3 className="font-sans text-xs text-[#151c27] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">history_edu</span>
        Catatan Konsultasi
      </h3>
      <div className="max-h-[120px] overflow-y-auto pr-2 font-sans text-sm text-[#444748] leading-relaxed">
        {notes ? `"${notes}"` : 'Belum ada catatan fitter.'}
      </div>
    </section>
  )
}
