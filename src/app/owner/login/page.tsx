'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { canAccessOwnerOS, normalizeRole } from '@/lib/rbac/roles'
import { PasswordUpdatedToast } from '@/components/auth/PasswordUpdatedToast'
import { APP_BRANDING } from '@/lib/auth/branding'

const branding = APP_BRANDING.owner

export default function OwnerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email wajib diisi.')
      return
    }
    if (!password) {
      setError('Password wajib diisi.')
      return
    }

    setLoading(true)
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

    if (!canAccessOwnerOS(normalizeRole(profile?.role))) {
      await supabase.auth.signOut()
      setError('Akun Anda tidak memiliki akses ke Owner OS.')
      setLoading(false)
      return
    }

    router.push('/command-center')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">

        {/* Header */}
        <div className="mb-12">
          <p className="text-label text-secondary uppercase tracking-widest mb-3">
            Login Pemilik
          </p>
          <h1 className="font-serif text-headline text-on-surface">
            Owner OS
          </h1>
          <p className="text-body text-secondary mt-2">
            Local Tailor Operating System
          </p>
          <p className="text-label text-secondary/80 mt-3">
            Secure access for Local Tailor management.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6" noValidate>
          <div>
            <label className="zone-label block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
          v1.0 · Local Tailor, Bandung
        </p>
      </div>

      <PasswordUpdatedToast loginPath={branding.loginPath} />
    </div>
  )
}
