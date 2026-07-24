'use client'

import { useRouter } from 'next/navigation'
import { Bell, Gauge, HeartHandshake, Scissors, ScrollText, Undo2 } from 'lucide-react'

interface HubCard {
  label: string
  description: string
  href: string
  icon: typeof Gauge
}

// Business Configuration Layer (Sprint K Milestone 1): every card here is
// real Runtime Configuration read live by an engine — parameters only,
// never a workflow toggle and never a placeholder. All six follow the same
// singleton + get_*_rules/set_*_rules pattern.
//
// - Commercial/Production: 20260811000000_add_business_rules_runtime_config.sql
// - Capacity: computed Capacity Engine + override audit (20260808000000) —
//   the calendar is engine output, never manual input
// - Return/Notification: 20260813000000_add_return_notification_rules.sql —
//   Return Rules replaces the QC Kategori Temuan hardcode; Notification
//   Rules gates assign_stage_operator's kiosk notification
// - Service: SLA day counts (20260728000000/20260804000003)
//
// "Skip Stage" is deliberately NOT here — granting a standing capability to
// skip stages is a workflow change, not a parameter. See Emergency Override
// (per order, audited) in 20260812000000.
const CARDS: HubCard[] = [
  {
    label: 'Commercial Rules',
    description: 'Minimal DP, Maksimal Diskon, Full Payment, KOL, Owner Override, Invoice Rules, Pembulatan Harga.',
    href: '/owner/business-rules/commercial',
    icon: HeartHandshake,
  },
  {
    label: 'Production Rules',
    description: 'QR Wajib, QC Wajib, Maksimum Alter, Alter Return Stage, Delivery Konfirmasi, Auto Close.',
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
    label: 'Return Rules',
    description: 'Kategori Temuan QC — alasan "Kembalikan" yang dipilih operator di kiosk.',
    href: '/owner/business-rules/return',
    icon: Undo2,
  },
  {
    label: 'Service Rules',
    description: 'SLA — jumlah hari kerja per tingkat layanan.',
    href: '/owner/business-rules/service',
    icon: ScrollText,
  },
  {
    label: 'Notification Rules',
    description: 'Notifikasi penugasan operator di kiosk produksi.',
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
