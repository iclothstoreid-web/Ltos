'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { assignStageOperator, getProductionPacket, listActiveOperators } from '@/lib/production/client'
import { STAGE_LABELS, getCurrentStageRecord } from '@/lib/production/stageConfig'
import type { Operator } from '@/lib/production/types'

interface AssignOperatorModalProps {
  orderId: string
  orderNumber: string
  onClose: () => void
  onAssigned: () => void
}

// Owner OS's "Tugaskan" flow: pick an operator for the order's next pending
// stage. get_production_packet is called first (idempotent — it auto-creates
// the material_prep pending record on first touch) so there's always a stage
// record to attach the assignment to, even for an order that hasn't been
// opened in the Production kiosk yet.
export function AssignOperatorModal({ orderId, orderNumber, onClose, onAssigned }: AssignOperatorModalProps) {
  const [supabase] = useState(() => createClient())
  const [operators, setOperators] = useState<Operator[]>([])
  const [stageRecordId, setStageRecordId] = useState<string | null>(null)
  const [stageLabel, setStageLabel] = useState<string | null>(null)
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [packet, activeOperators] = await Promise.all([
          getProductionPacket(supabase, orderId),
          listActiveOperators(supabase),
        ])
        if (cancelled) return
        const target = packet ? getCurrentStageRecord(packet.stage_records) : null
        if (!target) {
          setError('Order ini sudah menyelesaikan seluruh tahap produksi.')
        } else {
          setStageRecordId(target.id)
          setStageLabel(STAGE_LABELS[target.stage])
        }
        setOperators(activeOperators)
      } catch (err) {
        console.error('[command-center] load assign operator data failed', err)
        if (!cancelled) setError('Gagal memuat data operator.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [supabase, orderId])

  async function handleConfirm() {
    if (!stageRecordId || !selectedOperatorId) return
    setSaving(true)
    setError(null)
    try {
      await assignStageOperator(supabase, { orderId, stageRecordId, operatorId: selectedOperatorId })
      onAssigned()
      onClose()
    } catch (err) {
      console.error('[command-center] assign operator failed', err)
      setError('Gagal menugaskan operator. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e0]">
          <div>
            <h2 className="font-hanken text-sm uppercase tracking-widest text-[#161b29]">Pilih Operator</h2>
            <p className="font-hanken text-xs text-[#46464c] mt-0.5">
              {orderNumber}
              {stageLabel ? ` · ${stageLabel}` : ''}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <X size={18} className="text-[#46464c]" />
          </button>
        </div>

        <div className="px-6 py-5">
          {loading && <p className="font-hanken text-sm text-[#46464c] text-center py-4">Memuat...</p>}
          {error && <p className="font-hanken text-sm text-[#c0392b] mb-4">{error}</p>}

          {!loading && !error && (
            <>
              {operators.length === 0 ? (
                <p className="font-hanken text-sm text-[#46464c]">Belum ada operator aktif.</p>
              ) : (
                <ul className="space-y-2">
                  {operators.map(op => (
                    <li key={op.id}>
                      <label className="flex items-center gap-3 px-3 py-2 border border-[#e5e5e0] rounded-sm cursor-pointer hover:border-[#161b29] transition-colors">
                        <input
                          type="radio"
                          name="operator"
                          checked={selectedOperatorId === op.id}
                          onChange={() => setSelectedOperatorId(op.id)}
                          className="accent-[#161b29]"
                        />
                        <span className="font-hanken text-sm text-[#161b29]">
                          {op.nama}
                          {op.divisi && (
                            <span className="block font-hanken text-[10px] text-[#46464c]">{op.divisi}</span>
                          )}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedOperatorId || !stageRecordId || saving}
                className="mt-6 w-full py-3 bg-[#161b29] text-white font-hanken text-sm font-semibold
                           uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-50"
              >
                {saving ? 'Menugaskan...' : 'Tugaskan'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
