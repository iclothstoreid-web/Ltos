'use client'

import { useRouter } from 'next/navigation'
import {
  Boxes,
  ClipboardList,
  Gauge,
  Network,
  Package,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react'

interface HubCard {
  label: string
  description: string
  href: string
  icon: typeof Tag
  ownerOnly?: boolean
}

const CARDS: HubCard[] = [
  {
    label: 'Pricing',
    description: 'Harga setiap pilihan Design Master (edit langsung di kartu Design Master).',
    href: '/owner/master-data',
    icon: Tag,
  },
  {
    label: 'Design Master',
    description: 'Model, Kerah, Manset, Bahan, Warna, Aksesori, Bordir, Handmade Zig-Zag.',
    href: '/owner/master-data',
    icon: Sparkles,
  },
  {
    label: 'Material Master',
    description: 'Nama, kategori, supplier, default cost, default color, SKU, status — bukan stok.',
    href: '/owner/material-master',
    icon: Package,
    ownerOnly: true,
  },
  {
    label: 'Inventory',
    description: 'Monitoring stok, pergerakan stok, low-stock.',
    href: '/inventory',
    icon: Boxes,
  },
  {
    label: 'Operator',
    description: 'CRUD Operator, Divisi, status Aktif/Libur/Cuti/Nonaktif.',
    href: '/owner/operators',
    icon: Users,
    ownerOnly: true,
  },
  {
    label: 'Master Division',
    description: 'Tambah/Ubah/Nonaktifkan Divisi & urutan tampilan — sumber semua dropdown Divisi.',
    href: '/owner/master-division',
    icon: Network,
    ownerOnly: true,
  },
  {
    label: 'Business Rules',
    description: 'Commercial, Production, Capacity, Consultation, Service & Notification Rules.',
    href: '/owner/business-rules',
    icon: ClipboardList,
    ownerOnly: true,
  },
  {
    label: 'KPI Fitter',
    description: 'Konsultasi, closing, revenue, dan ranking per Fitter.',
    href: '/command-center/kpi-fitter',
    icon: Gauge,
  },
]

interface MasterDataCenterHubProps {
  canManageOperators: boolean
}

export function MasterDataCenterHub({ canManageOperators }: MasterDataCenterHubProps) {
  const router = useRouter()
  const cards = CARDS.filter(c => !c.ownerOnly || canManageOperators)

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Master Data Center</h1>
          <p className="text-xs text-[#444748]">Pricing, Design Master, Material, Inventory, Operator, Business & Service Rules</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/command-center')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-8 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(card => {
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
