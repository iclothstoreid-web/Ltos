'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

// Studio/Persediaan/Order/Analitik are visual-only placeholders (no real
// pages behind them yet) — kept in this array so each can be flipped back
// to `visible: true` once its own sprint ships a real route, but filtered
// out of the render below per the brief: Fitter's sidebar is a workspace,
// not a roadmap, so it should only ever list menus that actually work.
const NAV_ITEMS = [
  { label: 'Check-In', icon: 'person_add', active: true, visible: true },
  { label: 'Studio', icon: 'architecture', active: false, visible: false },
  { label: 'Persediaan', icon: 'straighten', active: false, visible: false },
  { label: 'Pesanan', icon: 'description', active: false, visible: false },
  { label: 'Analitik', icon: 'analytics', active: false, visible: false },
]

// "Bantuan" has no real function yet either (dead `href="#"`, no handler) —
// hidden alongside the placeholders above until it actually does something.
const BANTUAN_HAS_FUNCTION = false

// Only "Check-In" is a live route this sprint — the rest are visual-only
// placeholders (no Atelier/Inventory/Orders/Analytics pages exist yet, and
// building them is explicitly out of scope), matching the Stitch reference's
// own `href="#"` placeholders. "Master Data" is the one exception: it's a
// real, always-existing route (/owner/master-data, same page/component
// Owner OS uses), shown only for accounts allowed to manage it.
//
// Query Optimization (STEP 2, P1) — role now comes in as a prop, computed
// server-side (check-in/page.tsx via getCurrentRole(), the same
// middleware-forwarded x-user-role header every other workspace page
// already reuses) instead of this component re-running its own
// auth.getUser() + profiles.role query on every mount.
interface CheckInSidebarProps {
  showMasterData: boolean
  // Brand System Upgrade — mobile-first fix: this sidebar was `hidden
  // lg:flex` with no mobile replacement at all, so "Master Data" (when
  // showMasterData is true) was completely unreachable below the lg
  // breakpoint. Mirrors LeftSidebar.tsx/InventoryShell.tsx's own established
  // mobile-drawer pattern instead of inventing a new one.
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function SidebarBrand() {
  return (
    <div className="px-6 mb-10">
      <h1 className="font-fraunces text-2xl text-[#151c27] tracking-tight">Fitter App</h1>
      <Logo variant="horizontal" className="mt-1 h-8 w-auto text-[#444748] opacity-60" />
    </div>
  )
}

function SidebarNav({ showMasterData, onNavigate }: { showMasterData: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1">
      {NAV_ITEMS.filter(item => item.visible).map(item => (
        <a
          key={item.label}
          href="#"
          aria-disabled={!item.active}
          onClick={e => {
            if (!item.active) e.preventDefault()
            else onNavigate?.()
          }}
          className={`flex min-h-[44px] items-center px-6 py-4 transition-all duration-200 ${
            item.active
              ? 'text-[#151c27] bg-[#e2e8f8] border-l-4 border-[#775a19]'
              : 'text-[#444748] opacity-50 cursor-default'
          }`}
        >
          <span
            className="material-symbols-outlined mr-4"
            style={item.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {item.icon}
          </span>
          <span className="font-sans text-sm">{item.label}</span>
        </a>
      ))}
      {showMasterData && (
        <Link
          href="/owner/master-data-center"
          onClick={onNavigate}
          className="flex min-h-[44px] items-center px-6 py-4 text-[#444748] hover:text-[#151c27] hover:bg-[#e2e8f8]/60 transition-all duration-200"
        >
          <span className="material-symbols-outlined mr-4">style</span>
          <span className="font-sans text-sm">Master Data</span>
        </Link>
      )}
    </nav>
  )
}

export function CheckInSidebar({ showMasterData, mobileOpen = false, onMobileClose }: CheckInSidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex flex-col h-full py-8 bg-[#f9f9ff] border-r-[0.5px] border-[#c4c7c7] w-64 shrink-0">
        <SidebarBrand />
        <SidebarNav showMasterData={showMasterData} />
        {BANTUAN_HAS_FUNCTION && (
          <div className="px-6 mt-auto">
            <a className="flex items-center py-4 text-[#444748] hover:text-[#775a19] transition-colors" href="#">
              <span className="material-symbols-outlined mr-4">help_outline</span>
              <span className="font-sans text-sm">Bantuan</span>
            </a>
          </div>
        )}
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-[#f9f9ff] py-8 shadow-2xl lg:hidden">
            <div className="flex items-start justify-between px-6">
              <div className="mb-10">
                <h1 className="font-fraunces text-2xl text-[#151c27] tracking-tight">Fitter App</h1>
                <Logo variant="horizontal" className="mt-1 h-8 w-auto text-[#444748] opacity-60" />
              </div>
              <button
                onClick={onMobileClose}
                aria-label="Tutup menu"
                className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center rounded-full text-[#444748] hover:bg-black/5"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarNav showMasterData={showMasterData} onNavigate={onMobileClose} />
          </aside>
        </>
      )}
    </>
  )
}
