'use client'

import { useState } from 'react'
import type { RecentConsultation } from '../types'

// The Stitch reference shows four static demo metrics (today's customers,
// returning rate, new customers today, avg. consultation time). This repo
// has no aggregate-stats query, and adding one is out of scope ("do not
// modify Supabase queries/actions"), so this reuses the existing
// getRecentConsultations() action (unmodified, just a larger limit) and
// derives only what's honestly computable from that data — no invented
// numbers.
//
// Fetch Strategy (STEP 5.1) — this data is read-only at initial load and
// doesn't depend on anything client-side, so it's now fetched server-side
// (check-in/page.tsx) and passed in here instead of this component fetching
// it itself on mount (which showed "—" placeholders until that round trip
// resolved).
interface ConsultationInsightsProps {
  initialConsultations: RecentConsultation[]
}

export function ConsultationInsights({ initialConsultations }: ConsultationInsightsProps) {
  const [consultations] = useState<RecentConsultation[]>(initialConsultations)
  // Collapsed by default below `lg` only — the 4 stat cards make this
  // section tall on mobile/tablet, so it opens on demand there (Task 8).
  // `lg:flex` below always forces it visible on desktop regardless of this
  // state, so desktop behavior/appearance is unchanged.
  const [expanded, setExpanded] = useState(false)

  const todayStr = new Date().toDateString()
  const today = consultations.filter(c => new Date(c.created_at).toDateString() === todayStr)
  const waiting = consultations.filter(c => c.status === 'check_in' || c.status === 'waiting_measurement')
  const completed = consultations.filter(c => c.status === 'order_created')

  const cards = [
    { icon: 'group', label: "Konsultasi Hari Ini", value: String(today.length) },
    { icon: 'edit_note', label: 'Menunggu Diproses', value: String(waiting.length) },
    { icon: 'task_alt', label: 'Order Selesai', value: String(completed.length) },
    { icon: 'history', label: `Total Sesi (${consultations.length >= 50 ? '50+' : consultations.length})`, value: String(consultations.length) },
  ]

  return (
    <section className="w-full lg:w-[25%] border-t lg:border-t-0 lg:border-l-[0.5px] border-[#c4c7c7] bg-white/30 lg:overflow-y-auto">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="lg:hidden w-full flex items-center justify-between px-8 py-4 min-h-[44px]"
      >
        <span className="font-sans text-xs uppercase tracking-widest text-[#444748]">
          Wawasan Konsultasi
        </span>
        <span className="material-symbols-outlined text-[#444748]">
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      <h3 className="hidden lg:block font-sans text-xs uppercase tracking-widest text-[#444748] px-8 pt-8 mb-4">
        Wawasan Konsultasi
      </h3>
      <div
        className={`${expanded ? 'flex' : 'hidden'} lg:flex flex-col gap-6 px-8 pb-8 pt-0 lg:pt-0`}
      >
        {cards.map(card => (
          <div
            key={card.label}
            className="p-6 bg-white rounded-xl border border-[#c4c7c7]/30 shadow-[0_12px_24px_-10px_rgba(107,114,128,0.08)]"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="w-10 h-10 bg-[#e2e8f8] flex items-center justify-center rounded-lg">
                <span className="material-symbols-outlined text-[#775a19]">{card.icon}</span>
              </span>
            </div>
            <p className="font-fraunces text-5xl leading-none text-[#151c27]">{card.value}</p>
            <p className="font-sans text-xs text-[#444748] uppercase mt-2">{card.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
