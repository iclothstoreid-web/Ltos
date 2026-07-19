'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order, Measurement, BusinessEvent } from '@/types'
import { WorkspaceHeader } from './WorkspaceHeader'
import { EventHistory } from './EventHistory'
import { QC_CHECKLIST } from '@/lib/ltos'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

interface QCWorkspaceProps {
  order: Order & { customers: { name: string; phone: string | null } }
  measurement: Measurement | null
  events: BusinessEvent[]
  userId: string
}

export function QCWorkspace({
  order,
  measurement,
  events,
  userId,
}: QCWorkspaceProps) {
  const router = useRouter()
  const supabase = createClient()

  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    Object.fromEntries(QC_CHECKLIST.map(item => [item, false]))
  )
  const [failReason, setFailReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const allChecked = Object.values(checklist).every(Boolean)

  function toggleCheck(item: string) {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }))
  }

  async function handleDecision(decision: 'pass' | 'fail') {
    setLoading(true)
    try {
      const eventType = decision === 'pass' ? 'qc.passed' : 'qc.failed'

      await supabase.rpc('emit_event', {
        p_order_id: order.id,
        p_event_type: eventType,
        p_event_data: {
          checklist,
          fail_reason: decision === 'fail' ? failReason : null,
        },
        p_user_id: userId,
      })

      if (decision === 'pass') {
        // Create delivery task
        await supabase.rpc('create_queue_task', {
          p_order_id: order.id,
          p_queue_type: 'delivery',
        })
      } else {
        // Return to production
        await supabase.rpc('create_queue_task', {
          p_order_id: order.id,
          p_queue_type: 'production',
        })
      }

      // Complete QC task
      await supabase
        .from('queue_assignments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('order_id', order.id)
        .eq('queue_type', 'qc')

      router.push('/command-center')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-outline-variant">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-secondary hover:text-on-surface transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-label text-secondary uppercase tracking-widest">
            Workspace · Pemeriksaan Kualitas
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 animate-slide-up">

        {/* HEADER */}
        <WorkspaceHeader
          customerName={order.customers.name}
          orderNumber={order.order_number}
          currentState="qc"
          stateLabel="Step 9 dari 11"
        />

        {/* CONTEXT — measurement reference */}
        {measurement && (
          <div className="mt-8 pl-4 border-l-2 border-outline-variant">
            <p className="zone-label">Ukuran Referensi</p>
            <div className="grid grid-cols-2 gap-2 text-body text-secondary">
              <span>Dada: {measurement.chest} cm</span>
              <span>Bahu: {measurement.shoulder} cm</span>
              <span>Lengan: {measurement.sleeve} cm</span>
              <span>Panjang: {measurement.length} cm</span>
            </div>
          </div>
        )}

        {/* TASK — QC checklist */}
        <div className="mt-10">
          <p className="zone-label">Checklist Inspeksi</p>

          <div className="space-y-0 border-t border-outline-variant">
            {QC_CHECKLIST.map(item => (
              <label
                key={item}
                className="flex items-center gap-4 py-4 border-b border-outline-variant
                           cursor-pointer group hover:bg-surface-low transition-colors px-1"
              >
                <div
                  className={`w-5 h-5 border flex-shrink-0 flex items-center justify-center
                    transition-all duration-150
                    ${checklist[item]
                      ? 'bg-primary border-primary'
                      : 'border-outline-variant group-hover:border-secondary'
                    }`}
                >
                  {checklist[item] && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={checklist[item]}
                  onChange={() => toggleCheck(item)}
                  className="sr-only"
                />
                <span className={`text-body ${
                  checklist[item] ? 'text-on-surface' : 'text-secondary'
                }`}>
                  {item}
                </span>
              </label>
            ))}
          </div>

          {/* Fail reason — shows if not all checked */}
          {!allChecked && (
            <div className="mt-6">
              <label className="zone-label block mb-2">Catatan Kegagalan</label>
              <textarea
                value={failReason}
                onChange={e => setFailReason(e.target.value)}
                rows={3}
                placeholder="Jelaskan apa yang perlu diperbaiki..."
                className="w-full border-b border-outline-variant bg-transparent py-3
                           text-body text-on-surface outline-none resize-none
                           focus:border-error transition-colors
                           placeholder:text-secondary/30"
              />
            </div>
          )}
        </div>

        {/* DECISION */}
        <div className="mt-12 pt-8 border-t border-outline-variant">
          <p className="zone-label mb-6">Keputusan</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleDecision('pass')}
              disabled={!allChecked || loading}
              className="decision-primary flex items-center justify-center gap-2
                         disabled:opacity-40 disabled:cursor-not-allowed flex-1"
            >
              <CheckCircle size={16} />
              Lulus QC — Siap Kirim
            </button>

            <button
              onClick={() => handleDecision('fail')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3
                         border border-error text-error text-label font-medium
                         uppercase tracking-widest transition-all duration-200
                         hover:bg-error hover:text-white disabled:opacity-40 flex-1"
            >
              <XCircle size={16} />
              Gagal — Kembali ke Produksi
            </button>
          </div>

          {!allChecked && (
            <p className="text-label text-error mt-3">
              Selesaikan semua checklist sebelum menyatakan LULUS.
            </p>
          )}
        </div>

        {/* HISTORY */}
        <div className="mt-12">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-label text-secondary uppercase tracking-widest
                       flex items-center gap-2 hover:text-on-surface transition-colors"
          >
            Riwayat · {events.length} event
            <span className="text-xs">{showHistory ? '▲' : '▼'}</span>
          </button>
          {showHistory && <EventHistory events={events} />}
        </div>
      </div>
    </div>
  )
}
