'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { canManageMasterData } from '@/lib/design/masterData'

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
// Owner OS uses), shown only for accounts allowed to manage it — fetched
// client-side here so this sidebar stays self-contained and check-in's
// page.tsx (locked Fitter workflow) doesn't need to change.
export function CheckInSidebar() {
  const router = useRouter()
  const [showMasterData, setShowMasterData] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadRole() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (!cancelled) setShowMasterData(canManageMasterData(profile?.role))
    }
    loadRole()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <aside className="hidden lg:flex flex-col h-full py-8 bg-[#f9f9ff] border-r-[0.5px] border-[#c4c7c7] w-64 shrink-0">
      <div className="px-6 mb-10">
        <h1 className="font-fraunces text-2xl text-[#151c27] tracking-tight">LTOS</h1>
        <p className="text-[#444748] font-sans text-xs opacity-60 mt-1">Local Tailor Operating System</p>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.filter(item => item.visible).map(item => (
          <a
            key={item.label}
            href="#"
            aria-disabled={!item.active}
            onClick={e => {
              if (!item.active) e.preventDefault()
            }}
            className={`flex items-center px-6 py-4 transition-all duration-200 ${
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
          <a
            href="/owner/master-data"
            onClick={e => {
              e.preventDefault()
              router.push('/owner/master-data')
            }}
            className="flex items-center px-6 py-4 text-[#444748] hover:text-[#151c27] hover:bg-[#e2e8f8]/60 transition-all duration-200"
          >
            <span className="material-symbols-outlined mr-4">style</span>
            <span className="font-sans text-sm">Master Data</span>
          </a>
        )}
      </nav>
      {BANTUAN_HAS_FUNCTION && (
        <div className="px-6 mt-auto">
          <a className="flex items-center py-4 text-[#444748] hover:text-[#775a19] transition-colors" href="#">
            <span className="material-symbols-outlined mr-4">help_outline</span>
            <span className="font-sans text-sm">Bantuan</span>
          </a>
        </div>
      )}
    </aside>
  )
}
