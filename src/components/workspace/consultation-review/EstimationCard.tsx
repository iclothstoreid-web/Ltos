'use client'

import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { EstimasiPengerjaan } from './fitterEnhancementsCodec'
import {
  getServiceSlaRules,
  mapEstimasiToServiceLevel,
  previewServiceValidation,
  type ServiceSlaRule,
  type ServiceValidationResult,
} from '@/lib/order/service'

interface EstimationCardProps {
  supabase: SupabaseClient
  value: EstimasiPengerjaan
  onChange: (value: EstimasiPengerjaan) => void
  saving: boolean
}

// 🟢/🟡/🔴 per the Service Validation spec -- Available / Warning / Over
// Capacity. No AI recommendation, just the deterministic signal from
// preview_service_validation (Hari D + Capacity + KPI).
const STATUS_DISPLAY: Record<ServiceValidationResult['overall_status'], { dot: string; label: string }> = {
  green: { dot: 'bg-[#2e7d32]', label: 'Tersedia' },
  yellow: { dot: 'bg-[#b8860b]', label: 'Peringatan' },
  red: { dot: 'bg-[#c0392b]', label: 'Kapasitas Penuh' },
}

export function EstimationCard({ supabase, value, onChange, saving }: EstimationCardProps) {
  // SLA Engine: working-day counts are never hardcoded here -- they're
  // fetched from service_sla_rules via get_service_sla_rules() so an owner
  // changing the business rule is reflected immediately, with no redeploy.
  const [slaRules, setSlaRules] = useState<ServiceSlaRule[]>([])
  const [validation, setValidation] = useState<ServiceValidationResult | null>(null)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    let cancelled = false
    getServiceSlaRules(supabase)
      .then(rules => {
        if (!cancelled) setSlaRules(rules)
      })
      .catch(err => console.error(err))
    return () => {
      cancelled = true
    }
  }, [supabase])

  useEffect(() => {
    const serviceLevel = mapEstimasiToServiceLevel(value)
    if (!serviceLevel) {
      setValidation(null)
      return
    }

    let cancelled = false
    setValidating(true)
    previewServiceValidation(supabase, serviceLevel)
      .then(result => {
        if (!cancelled) setValidation(result)
      })
      .catch(err => {
        console.error(err)
        if (!cancelled) setValidation(null)
      })
      .finally(() => {
        if (!cancelled) setValidating(false)
      })
    return () => {
      cancelled = true
    }
  }, [supabase, value])

  const statusDisplay = validation ? STATUS_DISPLAY[validation.overall_status] : null

  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7]">
      <h3 className="font-sans text-xs text-[#151c27] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">schedule</span>
        Estimasi Pengerjaan
      </h3>
      <select
        value={value}
        disabled={saving}
        onChange={e => onChange(e.target.value as EstimasiPengerjaan)}
        className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19] disabled:opacity-60"
      >
        <option value="">Pilih estimasi</option>
        {slaRules.map(rule => (
          <option key={rule.service_level} value={rule.label}>
            {rule.label} ({rule.working_days} hari kerja)
          </option>
        ))}
      </select>

      {validating && <p className="mt-3 text-xs text-[#7a7a7a]">Memeriksa ketersediaan…</p>}

      {!validating && statusDisplay && validation && (
        <div className="mt-3 border-[0.5px] border-[#c4c7c7] p-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusDisplay.dot}`} />
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#151c27]">
              {statusDisplay.label}
            </span>
          </div>
          {validation.estimated_completion && (
            <p className="mt-2 text-xs text-[#444748]">
              Estimasi selesai:{' '}
              {new Date(validation.estimated_completion).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
          {validation.reasons.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs text-[#775a19]">
              {validation.reasons.map(reason => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
