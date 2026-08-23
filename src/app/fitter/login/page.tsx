'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { canAccessFitterApp, normalizeRole } from '@/lib/rbac/roles'
import { PasswordUpdatedToast } from '@/components/auth/PasswordUpdatedToast'
import { APP_BRANDING } from '@/lib/auth/branding'
import BrandLogo from '@/components/brand/BrandLogo'
import { getLoginBrandMeta } from '@/lib/brand/client'

const branding = APP_BRANDING.fitter

export default function FitterLoginPage() {
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email atau password salah.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (!canAccessFitterApp(normalizeRole(profile?.role))) {
      await supabase.auth.signOut()
      setError('Akun Anda tidak memiliki akses ke Fitter App.')
      setLoading(false)
      return
    }

    router.push('/workspace/check-in')
    router.refresh()
  }

  return (
    <div className={loginBrand.shellClassName}>
      <div className="w-full max-w-sm animate-fade-in">

        {/* Header */}
        <div className="mb-10 text-center">
          <BrandLogo variant="horizontal" className="mx-auto mb-6 block h-11 w-auto text-luxury-ivory md:h-14" />
          <p className="mb-3 text-label uppercase tracking-widest text-luxury-gold">
            Login Fitter
          </p>
          <h1 className="font-serif text-headline text-luxury-ivory">
            Fitter App
          </h1>
          <p className="mt-1 text-label text-luxury-taupe">
            Professional measurement and customer fitting workspace.
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

          <div className="text-center">
            <Link
              href={branding.forgotPasswordPath}
              className="text-label text-secondary hover:text-on-surface uppercase tracking-widest transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        {/* Footer */}
        <p className="text-label text-secondary mt-12 text-center">
          {loginBrand.footerLabel}
        </p>
      </div>

      <PasswordUpdatedToast loginPath={branding.loginPath} />
    </div>
  )
}
