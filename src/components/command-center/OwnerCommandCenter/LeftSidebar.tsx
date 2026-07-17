'use client'

import Link from 'next/link'
import {
  Activity,
  BarChart3,
  Boxes,
  Calendar,
  ClipboardList,
  Factory,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react'

// Owner OS is monitoring/decision-making only — every operational workspace
// (Check-In, Pengukuran, Design Studio, Review Konsultasi, Order Created,
// Produksi, QC, Persediaan) lives in its own app now, not here. Command
// Center is a single page today, so every item below points at it; items
// with no built data source yet (Inventory App, Customer Journey, Analitik,
// Pengaturan) are placeholders until those apps exist. Komunikasi is the one
// exception — it's a real Owner OS page (/owner/communications).
const navItems = [
  { label: 'Dashboard', href: '/command-center', icon: LayoutDashboard },
  { label: 'Hari Ini', href: '/command-center', icon: Calendar },
  { label: 'Antrian Keputusan', href: '/command-center', icon: ClipboardList },
  { label: 'Komunikasi', href: '/owner/communications', icon: MessageSquare },
  { label: 'Monitoring Produksi', href: '/command-center', icon: Factory },
  { label: 'Monitoring Persediaan', href: '/command-center', icon: Boxes },
  { label: 'Monitoring Perjalanan Pelanggan', href: '/command-center', icon: Users },
  { label: 'Aktivitas Sistem', href: '/command-center', icon: Activity },
  { label: 'Analitik', href: '/command-center', icon: BarChart3 },
  { label: 'Pengaturan', href: '/command-center', icon: Settings },
]

export function LeftSidebar() {
  return (
    <nav className="hidden lg:flex lg:flex-col w-[280px] shrink-0 border-r border-outline-variant/80 bg-surface/75 backdrop-blur-sm relative overflow-hidden">
      {/* architectural base surface */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(252,250,248,0.65)_0%,rgba(240,236,236,0.55)_100%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(90deg,rgba(0,86,69,0.035)_0px,rgba(0,86,69,0.035)_1px,transparent_1px,transparent_56px)] opacity-[0.18]" />

      <div className="relative px-6 py-6 flex items-center gap-3 border-b border-outline-variant/80">
        <span className="font-serif text-primary text-title font-normal tracking-[-0.02em]">LTOS</span>
      </div>

      <div className="relative flex-1 overflow-auto">
        <ul className="p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 px-3 py-2 rounded-[14px] text-body text-secondary/90 transition-all duration-200 hover:bg-on-surface/4 hover:text-on-surface hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                >
                  <Icon size={16} className="text-secondary/80 group-hover:text-on-surface transition-colors" />

                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}


