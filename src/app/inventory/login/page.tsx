'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Same shape as src/app/owner/login/page.tsx — reuses LTOS Authentication
// as-is (signInWithPassword), just a different redirect target. Inventory
// is a distinct workspace (Owner/Admin only, see canManageInventory), not a
// new auth system.
export default function InventoryLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email atau password salah.')
      setLoading(false)
      return
    }

    router.push('/inventory')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">

        <div className="mb-12">
          <p className="text-label text-secondary uppercase tracking-widest mb-3">
            Login Inventory
          </p>
          <h1 className="font-serif text-headline text-on-surface">
            LTOS Inventory
          </h1>
          <p className="text-body text-secondary mt-2">
            Material Management
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="zone-label block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="reni@localtailor.id"
              className="w-full border-b border-outline-variant bg-transparent py-3 text-body
                         text-on-surface placeholder:text-secondary/50 outline-none
                         focus:border-primary transition-colors duration-200"
            />
          </div>

          <div>
            <label className="zone-label block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border-b border-outline-variant bg-transparent py-3 text-body
                         text-on-surface placeholder:text-secondary/50 outline-none
                         focus:border-primary transition-colors duration-200"
            />
          </div>

          {error && (
            <p className="text-body text-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="decision-primary w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-label text-secondary mt-12 text-center">
          v1.0 · Local Tailor, Bandung
        </p>
      </div>
    </div>
  )
}
