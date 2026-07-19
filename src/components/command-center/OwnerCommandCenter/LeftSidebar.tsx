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
// Produksi, QC, Persediaan) lives in its own app now, not here. Dashboard,
// Komunikasi, and Monitoring Persediaan are the only items with a real,
// distinct destination (/command-center, /owner/communications,
// /inventory) — the rest have no page of their own yet, so they're
// rendered disabled with a "Segera Hadir" badge instead of silently
// re-navigating to Dashboard.
const navItems = [
  { label: 'Dashboard', href: '/command-center', icon: LayoutDashboard, implemented: true },
  { label: 'Hari Ini', href: '/command-center', icon: Calendar, implemented: false },
  { label: 'Antrian Keputusan', href: '/command-center', icon: ClipboardList, implemented: false },
  { label: 'Komunikasi', href: '/owner/communications', icon: MessageSquare, implemented: true },
  { label: 'Monitoring Produksi', href: '/command-center', icon: Factory, implemented: false },
  { label: 'Monitoring Persediaan', href: '/inventory', icon: Boxes, implemented: true },
  { label: 'Monitoring Perjalanan Pelanggan', href: '/command-center', icon: Users, implemented: false },
  { label: 'Aktivitas Sistem', href: '/command-center', icon: Activity, implemented: false },
  { label: 'Analitik', href: '/command-center', icon: BarChart3, implemented: false },
  { label: 'Pengaturan', href: '/command-center', icon: Settings, implemented: false },
]

export function LeftSidebar() {
  return (
    <nav className="hidden lg:flex lg:flex-col w-[280px] shrink-0 border-r border-outline-variant/80 bg-surface/75 backdrop-blur-sm relative overflow-hidden">
      {/* architectural base surface */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(252,250,248,0.65)_0%,rgba(240,236,236,0.55)_100%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(90deg,rgba(0,86,69,0.035)_0px,rgba(0,86,69,0.035)_1px,transparent_1px,transparent_56px)] opacity-[0.18]" />

      <div className="relative px-6 py-6 flex flex-col gap-1 border-b border-outline-variant/80">
        <span className="font-serif text-primary text-title font-normal tracking-[-0.02em]">Owner OS</span>
        <span className="text-label text-secondary uppercase tracking-widest">Local Tailor Operating System</span>
      </div>

      <div className="relative flex-1 overflow-auto">
        <ul className="p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon

            if (!item.implemented) {
              return (
                <li key={item.label}>
                  <div
                    aria-disabled="true"
                    className="flex items-center gap-3 px-3 py-2 rounded-[14px] text-body text-secondary/90 cursor-default opacity-50"
                  >
                    <Icon size={16} className="text-secondary/80" />
                    <span className="truncate">{item.label}</span>
                    <span className="ml-auto shrink-0 text-label text-secondary/80 uppercase tracking-widest border border-outline-variant/80 rounded-full px-2 py-0.5">
                      Segera Hadir
                    </span>
                  </div>
                </li>
              )
            }

            return (
              <li key={item.label}>
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


