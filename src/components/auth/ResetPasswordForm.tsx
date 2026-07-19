'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { AppBranding } from '@/lib/auth/branding'

export function ResetPasswordForm({ app }: { app: AppBranding }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // The recovery link lands here with a Supabase session established
  // asynchronously (PKCE code exchange on the browser client) — the form
  // stays gated until that session shows up, otherwise updateUser() would
  // silently fail with no user in scope.
  const [status, setStatus] = useState<'verifying' | 'ready' | 'invalid'>('verifying')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) setStatus('ready')
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setStatus('ready')
      }
    })

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setStatus(current => (current === 'verifying' ? 'invalid' : current))
      }
    }, 5000)

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Password baru wajib diisi.')
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password harus sama.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Gagal memperbarui password. Silakan coba lagi.')
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.push(`${app.loginPath}?toast=password-updated`)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">

        <div className="mb-12">
          <p className="text-label text-secondary uppercase tracking-widest mb-3">
            {app.name}
          </p>
          <h1 className="font-serif text-headline text-on-surface">
            Atur Ulang Password
          </h1>
          <p className="text-body text-secondary mt-2">
            Masukkan password baru untuk akun Anda.
          </p>
        </div>

        {status === 'invalid' ? (
          <div className="space-y-8">
            <div className="border border-error/15 bg-error/[0.06] rounded-2xl p-6">
              <p className="text-body text-on-surface">
                Link reset password tidak valid atau telah kedaluwarsa.
              </p>
            </div>
            <Link
              href={app.forgotPasswordPath}
              className="text-label text-secondary hover:text-on-surface uppercase tracking-widest transition-colors"
            >
              ← Minta Link Baru
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="zone-label block mb-2">Password Baru</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={status !== 'ready'}
                className="w-full border-b border-outline-variant bg-transparent py-3 text-body
                           text-on-surface placeholder:text-secondary/50 outline-none
                           focus:border-primary transition-colors duration-200
                           disabled:opacity-50"
              />
            </div>

            <div>
              <label className="zone-label block mb-2">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={status !== 'ready'}
                className="w-full border-b border-outline-variant bg-transparent py-3 text-body
                           text-on-surface placeholder:text-secondary/50 outline-none
                           focus:border-primary transition-colors duration-200
                           disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="text-body text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || status !== 'ready'}
              className="decision-primary w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'verifying' ? 'Memverifikasi...' : loading ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
