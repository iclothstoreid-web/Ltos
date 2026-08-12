'use client'

import { useId, useRef, useState, type FormEvent } from 'react'

type FieldKey = 'height' | 'weight' | 'age'

interface FieldConfig {
  key: FieldKey
  label: string
  unit: string
  min: number
  max: number
  helper: string
}

const FIELDS: FieldConfig[] = [
  { key: 'height', label: 'Tinggi Badan', unit: 'cm', min: 140, max: 210, helper: 'Masukkan tinggi badan Anda antara 140–210 cm.' },
  { key: 'weight', label: 'Berat Badan', unit: 'kg', min: 35, max: 180, helper: 'Masukkan berat badan Anda antara 35–180 kg.' },
  { key: 'age', label: 'Usia', unit: 'tahun', min: 15, max: 80, helper: 'Masukkan usia Anda antara 15–80 tahun.' },
]

// Analytics stub (brief §"Analytics Stub") — fired once, on the visitor's
// first interaction with any field. No analytics provider is wired yet;
// this is the single hook a future sprint attaches real tracking to.
function handleEstimatorStart() {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[analytics stub] estimator_start')
  }
}

function errorFor(field: FieldConfig, rawValue: string): string | null {
  if (rawValue.trim() === '') return null
  const num = Number(rawValue)
  if (Number.isNaN(num)) return 'Masukkan angka yang valid.'
  if (num < field.min || num > field.max) return `Nilai harus antara ${field.min}–${field.max} ${field.unit}.`
  return null
}

// Sprint W0.2 — a valid submit navigates to /free-body-profile-estimator/
// result via the form's own native GET action, carrying height/weight/age
// as query params. No client-side router, no fetch, no database, no local
// storage — the browser does the navigation, matching brief constraints.
export function BodyEstimatorForm() {
  const [values, setValues] = useState<Record<FieldKey, string>>({ height: '', weight: '', age: '' })
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({ height: false, weight: false, age: false })
  const hasStarted = useRef(false)
  const formId = useId()

  function markStarted() {
    if (!hasStarted.current) {
      hasStarted.current = true
      handleEstimatorStart()
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
    setTouched({ height: true, weight: true, age: true })

    const firstInvalid = FIELDS.find((field) => values[field.key].trim() === '' || errorFor(field, values[field.key]) !== null)
    if (firstInvalid) {
      event.preventDefault()
      document.getElementById(`${formId}-${firstInvalid.key}`)?.focus()
      return
    }

    // Valid — no preventDefault, the form's own GET action navigates to
    // the result page with height/weight/age as query params.
  }

  return (
    <form
      id="estimator-form"
      action="/free-body-profile-estimator/result"
      method="GET"
      onSubmit={handleSubmit}
      noValidate
      className="scroll-mt-10 rounded-3xl border border-luxury-gold/[0.14] bg-luxury-charcoal/20 p-6 md:p-8"
    >
      <div className="space-y-6">
        {FIELDS.map((field) => {
          const error = touched[field.key] ? errorFor(field, values[field.key]) : null
          const inputId = `${formId}-${field.key}`
          const helperId = `${inputId}-helper`

          return (
            <div key={field.key}>
              <label htmlFor={inputId} className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe">
                {field.label} ({field.unit})
              </label>
              <input
                id={inputId}
                name={field.key}
                type="number"
                inputMode="numeric"
                min={field.min}
                max={field.max}
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
      </div>

      <button
        type="submit"
        className="mt-8 w-full cursor-pointer rounded-full bg-luxury-gold px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-black transition duration-300 hover:brightness-110 hover:shadow-[0_0_24px_rgba(200,162,74,0.45)] focus-visible:ring-2 focus-visible:ring-luxury-gold/50 sm:w-auto"
      >
        Lihat Estimasi Gratis
      </button>
    </form>
  )
}
