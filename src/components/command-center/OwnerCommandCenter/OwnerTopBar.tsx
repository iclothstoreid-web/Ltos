'use client'

import { Bell, Menu, Search, User } from 'lucide-react'

interface OwnerTopBarProps {
  profileName: string
  onMenuClick?: () => void
}

export function OwnerTopBar({ profileName, onMenuClick }: OwnerTopBarProps) {
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
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              placeholder="Cari order, customer, antrian..."
              className="w-full bg-on-surface/0 border border-outline-variant/90 rounded-[14px] pl-9 pr-3 py-2.5 text-body text-on-surface placeholder:text-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-0 transition-all duration-200"

              onChange={() => {}}
              aria-label="Pencarian"
            />
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
    </header>
  )
}

