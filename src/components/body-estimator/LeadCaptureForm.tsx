'use client'

import { useId, useRef, useState, type FormEvent } from 'react'

interface LeadInfo {
  name: string
  whatsapp: string
  email: string
}

interface LeadCaptureFormProps {
  onSubmit: (lead: LeadInfo) => void
}

type FieldKey = keyof LeadInfo

interface FieldConfig {
  key: FieldKey
  label: string
  type: string
  placeholder: string
  helper: string
}

const FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Nama', type: 'text', placeholder: 'Nama lengkap Anda', helper: 'Minimal 2 karakter.' },
  { key: 'whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '08xxxxxxxxxx', helper: 'Nomor WhatsApp aktif format Indonesia.' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'nama@email.com', helper: 'Untuk mengirim hasil estimasi Anda.' },
]

// Simple Indonesian mobile number check — 08xxxxxxxxxx / +628xx / 628xx,
// 9–13 digits after the country/trunk prefix.
function isValidIndonesianWhatsApp(value: string): boolean {
  return /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/.test(value.replace(/[\s-]/g, ''))
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function errorFor(key: FieldKey, rawValue: string): string | null {
  const value = rawValue.trim()
  if (value === '') return 'Wajib diisi.'
  if (key === 'name' && value.length < 2) return 'Nama minimal 2 karakter.'
  if (key === 'whatsapp' && !isValidIndonesianWhatsApp(value)) return 'Masukkan nomor WhatsApp Indonesia yang valid (contoh: 081234567890).'
  if (key === 'email' && !isValidEmail(value)) return 'Masukkan alamat email yang valid.'
  return null
}

// Analytics stub — fired once, on first interaction with any lead field.
function leadCaptureStart() {
  if (process.env.NODE_ENV !== 'production') console.debug('[analytics stub] lead_capture_start')
}

// Analytics stub — fired once the lead form validates and submits.
function leadCaptureSubmit() {
  if (process.env.NODE_ENV !== 'production') console.debug('[analytics stub] lead_capture_submit')
}

// Sprint W0.4 §"Lead Capture" — soft gate: this form never blocks the
// result above it (already rendered by the time this mounts). Submitting
// just hands the lead info up to ResultUnlockSection, which merges it with
// the W0.2 engine's output into a BookingDraft (in-memory only, no DB).
export function LeadCaptureForm({ onSubmit }: LeadCaptureFormProps) {
  const [values, setValues] = useState<LeadInfo>({ name: '', whatsapp: '', email: '' })
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({ name: false, whatsapp: false, email: false })
  const [submitted, setSubmitted] = useState(false)
  const hasStarted = useRef(false)
  const formId = useId()

  function markStarted() {
    if (!hasStarted.current) {
      hasStarted.current = true
      leadCaptureStart()
    }
  }

  function handleChange(key: FieldKey, value: string) {
    markStarted()
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleBlur(key: FieldKey) {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ name: true, whatsapp: true, email: true })

    const firstInvalid = FIELDS.find((field) => errorFor(field.key, values[field.key]) !== null)
    if (firstInvalid) {
      document.getElementById(`${formId}-${firstInvalid.key}`)?.focus()
      return
    }

    const lead: LeadInfo = { name: values.name.trim(), whatsapp: values.whatsapp.trim(), email: values.email.trim() }
    setSubmitted(true)
    leadCaptureSubmit()
    onSubmit(lead)
  }

  return (
    <div className="rounded-2xl border border-luxury-gold/[0.14] bg-luxury-charcoal/20 p-6 md:p-8">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Simpan Hasil Estimasi Anda</p>
      <p className="mt-2 max-w-md font-luxury-sans text-sm text-luxury-taupe">
        Dapatkan salinan hasil estimasi dan lanjutkan ke pengukuran langsung oleh fitter Tarda.
      </p>

      {submitted ? (
        <div role="status" className="mt-6 flex items-center gap-3 rounded-xl border border-luxury-gold/30 bg-luxury-gold/[0.06] px-4 py-3">
          <span aria-hidden="true" className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-luxury-gold/90 text-[11px] text-luxury-black">
            ✓
          </span>
          <p className="font-luxury-sans text-sm text-luxury-ivory">Profil Anda tersimpan, {values.name.trim()}.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          {FIELDS.map((field) => {
            const error = touched[field.key] ? errorFor(field.key, values[field.key]) : null
            const inputId = `${formId}-${field.key}`
            const helperId = `${inputId}-helper`

            return (
              <div key={field.key}>
                <label htmlFor={inputId} className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe">
                  {field.label}
                </label>
                <input
                  id={inputId}
                  name={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={values[field.key]}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  onFocus={markStarted}
                  onBlur={() => handleBlur(field.key)}
                  aria-describedby={helperId}
                  aria-invalid={error ? 'true' : 'false'}
                  required
                  className={`mt-2 w-full rounded-2xl border bg-luxury-navy-deep/60 px-4 py-3 font-luxury-sans text-base text-luxury-ivory placeholder:text-luxury-taupe/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold/50 ${
                    error ? 'border-error' : 'border-luxury-gold/20 focus:border-luxury-gold'
                  }`}
                />
                <p id={helperId} className={`mt-1.5 font-luxury-sans text-xs ${error ? 'text-error' : 'text-luxury-taupe/80'}`}>
                  {error ?? field.helper}
                </p>
              </div>
            )
          })}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-full border border-luxury-gold/40 px-8 py-3.5 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory transition duration-300 hover:border-luxury-gold hover:text-luxury-gold focus-visible:ring-2 focus-visible:ring-luxury-gold/50 sm:w-auto"
          >
            Save My Profile
          </button>
        </form>
      )}
    </div>
  )
}
