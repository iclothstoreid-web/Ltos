'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Boxes, Calculator, LayoutDashboard, User } from 'lucide-react'

// Same Owner OS shell tokens as OwnerCommandCenter (surface-01, atelier-bg,
// elev-1/2) — Inventory is an Owner/Admin-only workspace analogous to
// the Owner OS dashboard, not a new palette. Sidebar covers the 3 pages this app
// builds, plus a link back to Owner OS — LeftSidebar.tsx's own
// "Monitoring Persediaan" placeholder now points here.
const navItems = [
  { label: 'Dashboard', href: '/inventory', icon: LayoutDashboard },
  { label: 'Material', href: '/inventory/material', icon: Boxes },
  { label: 'Estimasi Biaya', href: '/inventory/estimasi', icon: Calculator },
]

export function InventoryShell({ profileName, children }: { profileName: string; children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-surface-01 text-text-primary flex atelier-bg">
      <nav className="hidden lg:flex lg:flex-col w-[280px] shrink-0 border-r border-outline-variant/80 bg-surface/75 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(252,250,248,0.65)_0%,rgba(240,236,236,0.55)_100%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(90deg,rgba(0,86,69,0.035)_0px,rgba(0,86,69,0.035)_1px,transparent_1px,transparent_56px)] opacity-[0.18]" />

        <div className="relative px-6 py-6 flex flex-col gap-1 border-b border-outline-variant/80">
          <span className="font-serif text-primary text-title font-normal tracking-[-0.02em]">LTOS Inventory</span>
          <span className="text-label text-secondary uppercase tracking-widest">Material Management</span>
        </div>

        <div className="relative flex-1 overflow-auto">
          <ul className="p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-[14px] text-body transition-all duration-200 hover:bg-on-surface/4 hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none ${
                      active ? 'bg-on-surface/5 text-on-surface font-medium' : 'text-secondary/90 hover:text-on-surface'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-on-surface' : 'text-secondary/80 group-hover:text-on-surface transition-colors'} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="relative p-4 border-t border-outline-variant/80">
          <Link
            href="/command-center"
            className="text-label text-secondary hover:text-on-surface uppercase tracking-widest transition-colors"
          >
            ← Owner OS
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-outline-variant/80 bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-4 flex items-center justify-end gap-2">
            <button
              className="p-2 rounded-[9999px] border border-outline-variant/90 text-secondary/90 hover:text-on-surface hover:bg-on-surface/5 transition-all duration-200"
              aria-label="Notifikasi"
            >
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-[9999px] border border-outline-variant/90 shadow-[0_1px_0_rgba(27,27,28,0.03)]">
              <User size={16} className="text-secondary" />
              <span className="text-body text-secondary max-w-[140px] truncate">{profileName}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 md:px-10 py-10 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
