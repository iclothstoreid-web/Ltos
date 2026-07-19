'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { AppBranding } from '@/lib/auth/branding'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordForm({ app }: { app: AppBranding }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email wajib diisi.')
      return
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Format email tidak valid.')
      return
    }

    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${app.resetPasswordPath}`,
    })
    // Supabase never reveals whether the email exists — always show the
    // same neutral confirmation regardless of the API result.
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">

        <div className="mb-12">
          <p className="text-label text-secondary uppercase tracking-widest mb-3">
            {app.name}
          </p>
          <h1 className="font-serif text-headline text-on-surface">
            Lupa Password
          </h1>
          <p className="text-body text-secondary mt-2">
            Masukkan email akun Anda untuk menerima link reset password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-8">
            <div className="border border-primary/15 bg-primary/[0.06] rounded-2xl p-6">
              <p className="text-body text-on-surface">
                Jika email terdaftar, kami telah mengirimkan link untuk mengatur ulang password.
              </p>
            </div>
            <Link
              href={app.loginPath}
              className="text-label text-secondary hover:text-on-surface uppercase tracking-widest transition-colors"
            >
              ← Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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

            {error && (
              <p className="text-body text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="decision-primary w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>

            <div className="text-center">
              <Link
                href={app.loginPath}
                className="text-label text-secondary hover:text-on-surface uppercase tracking-widest transition-colors"
              >
                ← Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
