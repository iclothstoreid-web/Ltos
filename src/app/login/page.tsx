'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BrandLogo from '@/components/brand/BrandLogo'
import { getLoginBrandMeta } from '@/lib/brand/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const loginBrand = getLoginBrandMeta()

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

    router.push('/workspace/check-in')
    router.refresh()
  }

  return (
    <div className={loginBrand.shellBaseClassName} style={loginBrand.shellStyle}>
      <div className="w-full max-w-sm animate-fade-in">

        {/* Header */}
        <div className="mb-10 text-center">
          <BrandLogo variant="horizontal" className="mx-auto mb-6 block h-11 w-auto text-luxury-ivory md:h-14" />
          <h1 className="font-serif text-headline text-luxury-ivory">
            Tarda
          </h1>
          <p className="mt-2 text-body text-luxury-taupe">
            Business Operating System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="zone-label block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="reni@localtailor.id"
              className="w-full border-b border-luxury-gold/40 bg-transparent py-3 text-body
                         text-luxury-ivory placeholder:text-luxury-taupe/60 outline-none
                         focus:border-luxury-gold transition-colors duration-200"
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
              className="w-full border-b border-luxury-gold/40 bg-transparent py-3 text-body
                         text-luxury-ivory placeholder:text-luxury-taupe/60 outline-none
                         focus:border-luxury-gold transition-colors duration-200"
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

        {/* Footer */}
        <p className="text-label text-secondary mt-12 text-center">
          {loginBrand.footerLabel}
        </p>
      </div>
    </div>
  )
}
