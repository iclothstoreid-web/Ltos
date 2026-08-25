'use client'

import { memo, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Bell, LayoutGrid, Menu, Search, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { searchOrdersGlobal, type OrderSearchResult } from '@/lib/order/lookup'

// PR-02 (Rendering Performance, Lazy Hydration) — only opened via local
// state (selectedOrderId), not part of first paint. Same component, same
// props; just excluded from the initial JS bundle until actually rendered.
const OrderDetailModal = dynamic(() => import('./OrderDetailModal').then(mod => mod.OrderDetailModal))

interface OwnerTopBarProps {
  profileName: string
  onMenuClick?: () => void
  // 'dark' is used only by the App Launcher (src/components/owner/AppLauncher),
  // whose walnut-gradient background needs this bar to blend in rather than
  // sit on top like a white admin navbar. Every other call site (Command
  // Center, Decision Center, Commercial, KPI Operator, KPI Fitter,
  // Communications) omits this prop and renders exactly as before.
  variant?: 'light' | 'dark'
}

// Search was previously a fully inert input (onChange={() => {}}, no state,
// no query) rendered on every Owner OS page. Wired here rather than in each
// page individually so all 8 call sites get the fix at once. Kept
// self-contained (own OrderDetailModal instance) instead of threading a
// shared "selected order" callback through every page that renders this
// bar, which would have meant touching each page's own local state.
// PR-01 (Rendering Performance) — memoized so this shared chrome (also used
// by Commercial/Decision/KPI Operator/KPI Fitter/Communications Center) does
// not re-render on unrelated parent state changes. Same API, same behavior.
function OwnerTopBarComponent({ profileName, onMenuClick, variant = 'light' }: OwnerTopBarProps) {
  const dark = variant === 'dark'
  const [supabase] = useState(() => createClient())
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OrderSearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      try {
        setResults(await searchOrdersGlobal(supabase, q))
      } catch (err) {
        console.error('[owner-search] failed', err)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, supabase])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectResult(orderId: string) {
    setSelectedOrderId(orderId)
    setShowResults(false)
    setQuery('')
  }

  return (
    <header
      className={
        dark
          ? 'border-b border-white/10 bg-[#221814]/70 backdrop-blur-sm sticky top-0 z-40'
          : 'border-b border-outline-variant/80 bg-surface/80 backdrop-blur-sm sticky top-0 z-40'
      }
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-4 flex items-center gap-2 sm:gap-4">

        <button
          onClick={onMenuClick}
          className={
            dark
              ? 'lg:hidden shrink-0 p-2 rounded-[9999px] border border-white/15 text-surface-low/80 hover:text-surface-low hover:bg-white/10 transition-all duration-200'
              : 'lg:hidden shrink-0 p-2 rounded-[9999px] border border-outline-variant/90 text-secondary/90 hover:text-on-surface hover:bg-on-surface/5 transition-all duration-200'
          }
          aria-label="Buka menu"
        >
          <Menu size={16} />
        </button>

        {/* App Launcher — the "back to home" affordance every Owner OS page
            gets for free by sharing this bar (Command Center, Decision
            Center, Commercial, KPI Operator, KPI Fitter, Communications). */}
        <Link
          href="/owner"
          className={
            dark
              ? 'shrink-0 p-2 rounded-[9999px] border border-warm-gold/40 text-warm-gold hover:text-surface-low hover:bg-white/10 transition-all duration-200 hover:-translate-y-[1px]'
              : 'shrink-0 p-2 rounded-[9999px] border border-outline-variant/90 text-secondary/90 hover:text-on-surface hover:bg-on-surface/5 transition-all duration-200 hover:-translate-y-[1px]'
          }
          aria-label="Buka App Launcher"
          title="App Launcher"
        >
          <LayoutGrid size={16} />
        </Link>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div ref={containerRef} className="relative flex-1 min-w-0">
            <Search
              size={16}
              className={dark ? 'absolute left-3 top-1/2 -translate-y-1/2 text-surface-low/60' : 'absolute left-3 top-1/2 -translate-y-1/2 text-secondary'}
            />
            <input
              placeholder="Cari order, customer, antrian..."
              className={
                dark
                  ? 'w-full bg-white/5 border border-white/15 rounded-[14px] pl-9 pr-3 py-2.5 text-body text-surface-low placeholder:text-surface-low/50 focus:outline-none focus:ring-2 focus:ring-warm-gold/30 focus:ring-offset-0 transition-all duration-200'
                  : 'w-full bg-on-surface/0 border border-outline-variant/90 rounded-[14px] pl-9 pr-3 py-2.5 text-body text-on-surface placeholder:text-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-0 transition-all duration-200'
              }
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              aria-label="Pencarian"
            />

            {showResults && query.trim().length >= 2 && (
              <div
                className={
                  dark
                    ? 'absolute top-full left-0 right-0 mt-2 bg-[#2A1E17] border border-white/15 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden z-50'
                    : 'absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant/90 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden z-50'
                }
              >
                {results.length === 0 ? (
                  <p className={dark ? 'px-4 py-3 text-body text-surface-low/70' : 'px-4 py-3 text-body text-secondary'}>
                    Tidak ada order/customer yang cocok.
                  </p>
                ) : (
                  results.map(r => (
                    <button
                      key={r.orderId}
                      type="button"
                      onClick={() => selectResult(r.orderId)}
                      className={
                        dark
                          ? 'w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors flex items-center justify-between gap-3'
                          : 'w-full text-left px-4 py-2.5 hover:bg-on-surface/5 transition-colors flex items-center justify-between gap-3'
                      }
                    >
                      <span className={dark ? 'text-body text-surface-low truncate' : 'text-body text-on-surface truncate'}>
                        {r.customerName}
                      </span>
                      <span className={dark ? 'text-label text-surface-low/60 shrink-0' : 'text-label text-secondary shrink-0'}>
                        {r.orderNumber}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={
              dark
                ? 'p-2 rounded-[9999px] border border-white/15 text-surface-low/80 hover:text-surface-low hover:bg-white/10 transition-all duration-200 hover:translate-y-[-1px]'
                : 'p-2 rounded-[9999px] border border-outline-variant/90 text-secondary/90 hover:text-on-surface hover:bg-on-surface/5 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]'
            }
            aria-label="Notifikasi"
          >
            <Bell size={16} />
          </button>

          <div
            className={
              dark
                ? 'hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-[9999px] border border-white/15'
                : 'hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-[9999px] border border-outline-variant/90 shadow-[0_1px_0_rgba(27,27,28,0.03)]'
            }
          >
            <User size={16} className={dark ? 'text-surface-low/70' : 'text-secondary'} />
            <span className={dark ? 'text-body text-surface-low/90 max-w-[140px] truncate' : 'text-body text-secondary max-w-[140px] truncate'}>
              {profileName}
            </span>
          </div>
        </div>
      </div>

      {selectedOrderId && <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
    </header>
  )
}

export const OwnerTopBar = memo(OwnerTopBarComponent)

