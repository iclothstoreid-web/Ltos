'use client'

interface TimelineEvent {
  event_type: string
  created_at: string
}

interface ProductionJourneyTimelineProps {
  events: TimelineEvent[]
}

const EVENT_LABELS: Record<string, string> = {
  'measurement.completed': 'Pengukuran Tercatat',
  'design.completed': 'Desain Difinalisasi',
  'consultation.approved': 'Konsultasi Disetujui',
  'consultation.completed': 'Konsultasi Selesai',
  'order.created': 'Pesanan Berhasil Dibuat',
}

// Real events from business_events, not Stitch's fixed three-step list —
// only event types this repo actually logs are shown. "Ready for Cutting"
// and beyond are visual future-step placeholders since Production isn't
// built/wired this sprint.
export function ProductionJourneyTimeline({ events }: ProductionJourneyTimelineProps) {
  const known = events.filter(e => EVENT_LABELS[e.event_type])

  return (
    <section className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-4">
      <h3 className="font-sans text-xs text-[#444748] uppercase tracking-widest mb-6 border-b border-[#c4c7c7] pb-2">
        Perjalanan Produksi
      </h3>
      <div className="relative pl-8 space-y-6">
        <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-[#c4c7c7]" />

        {known.map((event, i) => (
          <div className="relative" key={`${event.event_type}-${i}`}>
            <div className="absolute -left-8 w-6 h-6 bg-[#151c27] rounded-full flex items-center justify-center ring-4 ring-white">
              <span className="material-symbols-outlined text-white text-[14px]">check</span>
            </div>
            <p className="font-sans text-xs font-bold text-[#151c27]">
              {EVENT_LABELS[event.event_type]}
            </p>
            <p className="text-[10px] text-[#444748]">
              {new Date(event.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        ))}

        <div className="relative">
          <div className="absolute -left-8 w-6 h-6 bg-white border-2 border-[#151c27] rounded-full flex items-center justify-center ring-4 ring-white">
            <div className="w-2 h-2 bg-[#151c27] rounded-full animate-pulse" />
          </div>
          <p className="font-sans text-xs font-bold text-[#151c27]">Siap untuk Dipotong</p>
          <p className="text-[10px] text-[#775a19] italic">Menunggu penugasan atelier</p>
        </div>

        {['Menjahit & Perakitan', 'Kontrol Kualitas'].map(step => (
          <div className="relative opacity-40" key={step}>
            <div className="absolute -left-8 w-6 h-6 bg-[#dce2f3] border-2 border-[#c4c7c7] rounded-full ring-4 ring-white" />
            <p className="font-sans text-xs text-[#444748]">{step}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
