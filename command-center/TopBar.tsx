'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types'
import { LogOut } from 'lucide-react'

interface TopBarProps {
  profile: Profile | null
}

export function TopBar({ profile }: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-outline-variant bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-serif text-primary text-title font-normal">LTOS</span>
          <span className="text-outline-variant">·</span>
          <span className="text-label text-secondary uppercase tracking-widest">
            Command Center
          </span>
        </div>

        <div className="flex items-center gap-4">
          {profile && (
            <span className="text-body text-secondary">
              {profile.name}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-secondary hover:text-on-surface transition-colors p-1"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
