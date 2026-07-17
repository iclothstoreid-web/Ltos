'use client'

import { useEffect, useState } from 'react'
import { getConsultationHistory } from '../actions'
import type { Consultation } from '../types'

interface ConsultationHistoryProps {
  customerId: string
}

export function ConsultationHistory({ customerId }: ConsultationHistoryProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      const { consultations, error } = await getConsultationHistory(customerId, 5)
      if (error) setError(error)
      setConsultations(consultations)
      setLoading(false)
    }
    run()
  }, [customerId])

  if (loading) {
    return <p className="font-sans text-xs text-[#444748]">Memuat riwayat...</p>
  }

  return (
    <div className="space-y-6">
      <h4 className="font-sans text-xs uppercase tracking-widest text-[#444748] border-b border-[#c4c7c7] pb-4">
        Consultation History
      </h4>

      {error && <p className="font-sans text-sm text-[#ba1a1a] mt-2">{error}</p>}

      {consultations.length === 0 && !error && (
        <p className="font-sans text-sm text-[#444748] mt-2">Belum ada riwayat.</p>
      )}

      {consultations.length > 0 && (
        <div className="space-y-4">
          {consultations.map(c => (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-[#c4c7c7]/20"
            >
              <div className="flex gap-4 items-center min-w-0">
                <span className="material-symbols-outlined text-[#444748]">history</span>
                <div className="min-w-0">
                  <p className="font-sans text-sm font-semibold text-[#151c27] truncate">
                    {c.consultation_number}
                  </p>
                  <p className="text-[#444748] text-xs mt-0.5">{c.status}</p>
                </div>
              </div>
              <span className="font-sans text-xs text-[#444748] whitespace-nowrap ml-3">
                {c.completed_at
                  ? new Date(c.completed_at).toLocaleDateString('id-ID')
                  : new Date(c.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

