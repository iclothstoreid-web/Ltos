'use client'

import { useEffect, useRef, useState } from 'react'
import { saveDesignConfig } from '@/lib/configurator/client'
import { trackDesignSaved } from '@/lib/configurator/analytics'
import { useConfiguratorStore } from '@/stores/configurator-store'
import { useServiceLevelStore } from '@/stores/service-level-store'
import { ShareMenu } from './ShareMenu'
import { ConsultationCta } from './ConsultationCta'

const SAVED_DESIGNS_KEY = 'ltos:design-studio:saved-designs'

// Same dark-surface contrast fix as PriceSummaryCard.tsx — Material's
// shared `error` token reads ~2.9:1 on luxury-navy-deep (fails WCAG AA);
// this is ~6.7:1.
const DARK_SURFACE_ERROR_CLASSNAME = 'text-[#FF6B6B]'

interface SavedDesignRecord {
  designId: string
  shareUrl: string
  nama?: string
  savedAt: string
}

// Local persistence fallback ("local persistence" per the brief) — a
// convenience list of this browser's own saved designs. Not the sharing
// mechanism itself (that's the signed slug, see session.ts): this is
// purely so a returning visitor on the same device can find their past
// saves again.
function rememberSavedDesign(record: SavedDesignRecord) {
  try {
    const existing = JSON.parse(localStorage.getItem(SAVED_DESIGNS_KEY) ?? '[]') as SavedDesignRecord[]
    const next = [record, ...existing.filter((d) => d.designId !== record.designId)].slice(0, 20)
    localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — non-fatal
  }
}

interface SaveDesignModalProps {
  triggerLabel: string
  triggerClassName: string
  disabled?: boolean
}

export function SaveDesignModal({ triggerLabel, triggerClassName, disabled }: SaveDesignModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'saving' | 'success' | 'error'>('form')
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [result, setResult] = useState<{ designId: string; shareUrl: string } | null>(null)

  const firstFieldRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const config = useConfiguratorStore((s) => s.config)
  const serviceLevel = useServiceLevelStore((s) => s.serviceLevel)

  useEffect(() => {
    if (open) firstFieldRef.current?.focus()
  }, [open])

  // Background scroll lock (W2-5) — MobileConfiguratorDrawer gets this for
  // free from vaul; this hand-rolled dialog didn't have it, so the page
  // behind it could still scroll while open.
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') close()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const trimmedNama = nama.trim()
    const trimmedEmail = email.trim()
    if (!trimmedNama) {
      setFormError('Nama wajib diisi.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Email tidak valid.')
      return
    }

    setStep('saving')
    try {
      const lead = { nama: trimmedNama, email: trimmedEmail, whatsapp: whatsapp.trim() || undefined }
      const saved = await saveDesignConfig(config, serviceLevel, lead)
      setResult(saved)
      rememberSavedDesign({ designId: saved.designId, shareUrl: saved.shareUrl, nama: trimmedNama, savedAt: new Date().toISOString() })
      trackDesignSaved(saved.designId, true)
      setStep('success')
    } catch {
      setStep('error')
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          setStep('form')
          setFormError(null)
          setOpen(true)
        }}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-design-title"
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8 md:items-center"
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={close}
            className="fixed inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
          />

          {/* items-start + overflow-y-auto (W2-5) instead of a fixed
              items-center block — on mobile, the on-screen keyboard shrinks
              the visual viewport, and a purely centered fixed panel could
              clip below it with no way to reach the submit button. This
              keeps every field scrollable into view regardless of keyboard
              height. */}
          <div className="relative w-full max-w-sm rounded-2xl border border-luxury-gold/15 bg-luxury-navy-deep p-6 shadow-xl">
            <button
              type="button"
              onClick={close}
              aria-label="Tutup dialog"
              className="absolute right-2 top-2 flex h-11 w-11 cursor-pointer items-center justify-center font-luxury-sans text-sm text-luxury-taupe hover:text-luxury-ivory"
            >
              ✕
            </button>

            {step === 'form' || step === 'saving' ? (
              <form onSubmit={handleSubmit}>
                <h2 id="save-design-title" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
                  Simpan Desain
                </h2>
                <p className="mt-1 font-luxury-sans text-xs text-luxury-taupe">
                  Simpan desain Anda dan dapatkan link untuk dibagikan atau dilanjutkan ke konsultasi.
                </p>

                <div className="mt-5 space-y-3">
                  <div>
                    <label htmlFor="save-nama" className="mb-1 block font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe">
                      Nama
                    </label>
                    <input
                      ref={firstFieldRef}
                      id="save-nama"
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                      aria-invalid={formError === 'Nama wajib diisi.'}
                      aria-describedby={formError ? 'save-design-form-error' : undefined}
                      className="w-full rounded-md border border-luxury-gold/15 bg-luxury-navy px-3 py-2 font-luxury-sans text-xs text-luxury-ivory focus:border-luxury-gold/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="save-email" className="mb-1 block font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe">
                      Email
                    </label>
                    <input
                      id="save-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-invalid={formError === 'Email tidak valid.'}
                      aria-describedby={formError ? 'save-design-form-error' : undefined}
                      className="w-full rounded-md border border-luxury-gold/15 bg-luxury-navy px-3 py-2 font-luxury-sans text-xs text-luxury-ivory focus:border-luxury-gold/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="save-whatsapp" className="mb-1 block font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe">
                      WhatsApp (opsional)
                    </label>
                    <input
                      id="save-whatsapp"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full rounded-md border border-luxury-gold/15 bg-luxury-navy px-3 py-2 font-luxury-sans text-xs text-luxury-ivory focus:border-luxury-gold/50 focus:outline-none"
                    />
                  </div>
                </div>

                {formError && (
                  <p id="save-design-form-error" role="alert" className={`mt-3 font-luxury-sans text-xs ${DARK_SURFACE_ERROR_CLASSNAME}`}>
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={step === 'saving'}
                  className="mt-5 w-full cursor-pointer rounded-full bg-luxury-gold py-3 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {step === 'saving' ? 'Menyimpan…' : 'Simpan Desain'}
                </button>
              </form>
            ) : step === 'success' && result ? (
              <div>
                <h2 id="save-design-title" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
                  Desain Tersimpan
                </h2>
                <p className="mt-1 break-all font-luxury-sans text-xs text-luxury-taupe">{result.shareUrl}</p>

                <div className="mt-5">
                  <ShareMenu designId={result.designId} url={result.shareUrl} title="Desain Bespoke Saya" />
                </div>

                <ConsultationCta
                  designId={result.designId}
                  className="mt-3 block w-full cursor-pointer rounded-full border border-luxury-gold/30 py-2.5 text-center font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold transition hover:bg-luxury-gold/10"
                />
              </div>
            ) : (
              <div>
                <h2 id="save-design-title" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
                  Gagal Menyimpan
                </h2>
                <p className="mt-2 font-luxury-sans text-xs text-luxury-taupe">Terjadi kesalahan. Silakan coba lagi.</p>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="mt-4 w-full cursor-pointer rounded-full border border-luxury-gold/30 py-2.5 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold"
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
