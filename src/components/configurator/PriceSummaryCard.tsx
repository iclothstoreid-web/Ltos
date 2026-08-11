'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { formatRupiah } from '@/lib/format/money'
import { trackServiceLevelChanged } from '@/lib/configurator/analytics'
import { SERVICE_LEVELS, SERVICE_LEVEL_LABELS } from '@/lib/configurator/eta'
import type { ServiceLevel } from '@/types/configurator'
import { useConfiguratorStore } from '@/stores/configurator-store'
import { useServiceLevelStore } from '@/stores/service-level-store'
import { useEstimateRetryStore } from '@/stores/estimate-retry-store'
import { SaveDesignModal } from '@/components/design-share/SaveDesignModal'

const SAVE_TRIGGER_CLASSNAME =
  'mt-6 w-full cursor-pointer rounded-full bg-luxury-gold py-3 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40'

// Material's shared `error` token (#BA1A1A) was tuned for the app's light
// surfaces — on this card's dark luxury-navy/charcoal background it comes
// out to ~2.9:1 contrast, below WCAG AA's 4.5:1 for body text. This is a
// brighter red verified at ~6.7:1 on luxury-navy-deep, scoped to this card
// only rather than changing the shared token everywhere else it's used.
const DARK_SURFACE_ERROR_CLASSNAME = 'text-[#FF6B6B]'

export function PriceSummaryCard() {
  const estimate = useConfiguratorStore((s) => s.estimate)
  const serviceLevel = useServiceLevelStore((s) => s.serviceLevel)
  const setServiceLevel = useServiceLevelStore((s) => s.setServiceLevel)
  const retryEstimate = useEstimateRetryStore((s) => s.retry)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleServiceLevelChange = useCallback(
    (next: ServiceLevel) => {
      if (next === serviceLevel) return
      trackServiceLevelChanged(serviceLevel, next)
      setServiceLevel(next)
    },
    [serviceLevel, setServiceLevel]
  )

  return (
    <div className="rounded-2xl border border-luxury-gold/15 bg-luxury-charcoal/40 p-6">
      <h3 className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-ivory">Ringkasan Estimasi</h3>

      <fieldset className="mt-4">
        <legend className="mb-2 font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe">
          Service Level
        </legend>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Service Level">
          {SERVICE_LEVELS.map((level) => {
            const checked = serviceLevel === level
            return (
              <label
                key={level}
                className={`relative flex cursor-pointer items-center justify-center rounded-full border py-2 text-center transition focus-within:ring-2 focus-within:ring-luxury-gold/70 focus-within:ring-offset-2 focus-within:ring-offset-luxury-charcoal ${
                  checked ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold' : 'border-luxury-gold/15 text-luxury-taupe hover:border-luxury-gold/40'
                }`}
              >
                <input
                  type="radio"
                  name="service-level"
                  className="sr-only"
                  checked={checked}
                  onChange={() => handleServiceLevelChange(level)}
                  aria-label={SERVICE_LEVEL_LABELS[level]}
                />
                <span className="font-luxury-sans text-[10px] uppercase tracking-[0.06em]">{SERVICE_LEVEL_LABELS[level]}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* aria-live: screen reader users get told when the estimate finishes
          calculating / changes / fails, without re-announcing the whole
          card on every keystroke elsewhere on the page. */}
      <div aria-live="polite">
        {estimate.status === 'idle' && (
          <p className="mt-4 font-luxury-sans text-xs text-luxury-taupe">
            Pilih Model, Material, dan Warna untuk melihat estimasi harga.
          </p>
        )}

        {estimate.status === 'calculating' && (
          <div className="mt-4 space-y-2" aria-busy="true" aria-label="Menghitung estimasi">
            <div className="h-3 w-3/4 animate-pulse rounded bg-luxury-taupe/20" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-luxury-taupe/20" />
          </div>
        )}

        {estimate.status === 'error' && (
          <div className="mt-4">
            <p className={`font-luxury-sans text-xs ${DARK_SURFACE_ERROR_CLASSNAME}`}>
              {typeof navigator !== 'undefined' && !navigator.onLine
                ? 'Anda sedang offline — estimasi tidak dapat dihitung.'
                : 'Gagal menghitung estimasi.'}
            </p>
            <button
              type="button"
              onClick={retryEstimate}
              className="mt-2 cursor-pointer rounded-full border border-luxury-gold/30 px-4 py-1.5 font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-gold transition hover:bg-luxury-gold/10"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>

      {estimate.status === 'ready' && (
        <div className="mt-4 space-y-4" aria-live="polite">
          <div>
            <button
              type="button"
              onClick={() => setBreakdownOpen((v) => !v)}
              aria-expanded={breakdownOpen}
              aria-controls="price-breakdown"
              className="flex w-full cursor-pointer items-center justify-between font-luxury-sans text-xs text-luxury-taupe"
            >
              <span>Breakdown Harga</span>
              <span aria-hidden="true">{breakdownOpen ? '−' : '+'}</span>
            </button>
            <AnimatePresence initial={false}>
              {breakdownOpen && (
                <motion.ul
                  id="price-breakdown"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  className="mt-2 space-y-1.5 overflow-hidden"
                >
                  {estimate.breakdown.map((line, i) => (
                    <li key={`${line.kind}-${line.optionId ?? i}`} className="flex justify-between font-luxury-sans text-xs text-luxury-taupe">
                      <span>{line.label}</span>
                      <span className="text-luxury-ivory">{formatRupiah(line.amount)}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between border-t border-luxury-gold/15 pt-3 font-luxury-sans text-sm">
            <span className="text-luxury-ivory">Estimasi Total</span>
            <span className="text-luxury-gold">{formatRupiah(estimate.total)}</span>
          </div>

          <dl className="space-y-1 border-t border-luxury-gold/15 pt-3 font-luxury-sans text-xs">
            <div className="flex justify-between">
              <dt className="text-luxury-taupe">Estimasi Produksi</dt>
              <dd className="text-luxury-ivory">{estimate.productionDays} hari kerja</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-luxury-taupe">Tanggal Selesai</dt>
              <dd className="text-luxury-ivory">{estimate.completionDateFormatted}</dd>
            </div>
          </dl>

          <p className="font-luxury-sans text-[10px] text-luxury-taupe">
            Estimasi awal, bukan harga atau tanggal final — akan dikonfirmasi Fitter saat konsultasi.
          </p>
        </div>
      )}

      <SaveDesignModal
        triggerLabel="Simpan & Bagikan Desain"
        triggerClassName={SAVE_TRIGGER_CLASSNAME}
        disabled={estimate.status !== 'ready'}
      />
    </div>
  )
}
