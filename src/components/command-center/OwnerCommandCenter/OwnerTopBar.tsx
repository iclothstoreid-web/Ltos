'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Menu, Search, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { searchOrdersGlobal, type OrderSearchResult } from '@/lib/order/lookup'
import { OrderDetailModal } from './OrderDetailModal'

interface OwnerTopBarProps {
  profileName: string
  onMenuClick?: () => void
}

// Search was previously a fully inert input (onChange={() => {}}, no state,
// no query) rendered on every Owner OS page. Wired here rather than in each
// page individually so all 8 call sites get the fix at once. Kept
// self-contained (own OrderDetailModal instance) instead of threading a
// shared "selected order" callback through every page that renders this
// bar, which would have meant touching each page's own local state.
export function OwnerTopBar({ profileName, onMenuClick }: OwnerTopBarProps) {
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
    <header className="border-b border-outline-variant/80 bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-4 flex items-center gap-2 sm:gap-4">

        <button
          onClick={onMenuClick}
          className="lg:hidden shrink-0 p-2 rounded-[9999px] border border-outline-variant/90 text-secondary/90 hover:text-on-surface hover:bg-on-surface/5 transition-all duration-200"
          aria-label="Buka menu"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div ref={containerRef} className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              placeholder="Cari order, customer, antrian..."
              className="w-full bg-on-surface/0 border border-outline-variant/90 rounded-[14px] pl-9 pr-3 py-2.5 text-body text-on-surface placeholder:text-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-0 transition-all duration-200"
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              aria-label="Pencarian"
            />

            {showResults && query.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant/90 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden z-50">
                {results.length === 0 ? (
                  <p className="px-4 py-3 text-body text-secondary">Tidak ada order/customer yang cocok.</p>
                ) : (
                  results.map(r => (
                    <button
                      key={r.orderId}
                      type="button"
                      onClick={() => selectResult(r.orderId)}
                      className="w-full text-left px-4 py-2.5 hover:bg-on-surface/5 transition-colors flex items-center justify-between gap-3"
                    >
                      <span className="text-body text-on-surface truncate">{r.customerName}</span>
                      <span className="text-label text-secondary shrink-0">{r.orderNumber}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-[9999px] border border-outline-variant/90 text-secondary/90 hover:text-on-surface hover:bg-on-surface/5 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"

            aria-label="Notifikasi"
          >
            <Bell size={16} />
          </button>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-[9999px] border border-outline-variant/90 shadow-[0_1px_0_rgba(27,27,28,0.03)]">

            <User size={16} className="text-secondary" />
            <span className="text-body text-secondary max-w-[140px] truncate">{profileName}</span>
          </div>
        </div>
      </div>

      {selectedOrderId && <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
    </header>
  )
}

