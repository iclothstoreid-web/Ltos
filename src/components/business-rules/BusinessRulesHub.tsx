'use client'

import { useRouter } from 'next/navigation'
import { Bell, Gauge, HeartHandshake, MessageSquare, Scissors, ScrollText } from 'lucide-react'

interface HubCard {
  label: string
  description: string
  href: string
  icon: typeof Gauge
}

const CARDS: HubCard[] = [
  {
    label: 'Commercial Rules',
    description: 'Aturan komersial (diskon, KOL, override) — belum tersedia.',
    href: '/owner/business-rules/commercial',
    icon: HeartHandshake,
  },
  {
    label: 'Production Rules',
    description: 'Aturan alur produksi — belum tersedia.',
    href: '/owner/business-rules/production',
    icon: Scissors,
  },
  {
    label: 'Capacity Rules',
    description: 'Kalender Kapasitas (Hari D) — dihitung otomatis dari operator aktif.',
    href: '/owner/business-rules/capacity',
    icon: Gauge,
  },
  {
    label: 'Consultation Rules',
    description: 'Aturan konsultasi & fitter — belum tersedia.',
    href: '/owner/business-rules/consultation',
    icon: MessageSquare,
  },
  {
    label: 'Service Rules',
    description: 'SLA — jumlah hari kerja per tingkat layanan.',
    href: '/owner/business-rules/service',
    icon: ScrollText,
  },
  {
    label: 'Notification Rules',
    description: 'Aturan notifikasi — belum tersedia.',
    href: '/owner/business-rules/notification',
    icon: Bell,
  },
]

export function BusinessRulesHub() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Business Rules</h1>
          <p className="text-xs text-[#444748]">Pusat konfigurasi operasional LTOS</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/owner/master-data-center')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-8 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map(card => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => router.push(card.href)}
              className="text-left bg-white border-[0.5px] border-[#c4c7c7] p-5 hover:border-[#755b00] transition-colors"
            >
              <Icon size={20} className="text-[#755b00] mb-3" />
              <p className="font-hanken text-sm font-semibold">{card.label}</p>
              <p className="text-xs text-[#444748] mt-1">{card.description}</p>
            </button>
          )
        })}
      </main>
    </div>
  )
}
