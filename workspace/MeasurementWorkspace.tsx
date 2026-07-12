'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order, Measurement, BusinessEvent } from '@/types'
import { WorkspaceHeader } from './WorkspaceHeader'
import { EventHistory } from './EventHistory'
import { ArrowLeft, CheckCircle, RotateCcw } from 'lucide-react'

interface MeasurementWorkspaceProps {
  order: Order & { customers: { name: string; phone: string | null } }
  existingMeasurement: Measurement | null
  events: BusinessEvent[]
  userId: string
}

export function MeasurementWorkspace({
  order,
  existingMeasurement,
  events,
  userId,
}: MeasurementWorkspaceProps) {
  const router = useRouter()
  const supabase = createClient()

  const [chest, setChest] = useState(existingMeasurement?.chest?.toString() || '')
  const [shoulder, setShoulder] = useState(existingMeasurement?.shoulder?.toString() || '')
  const [sleeve, setSleeve] = useState(existingMeasurement?.sleeve?.toString() || '')
  const [length, setLength] = useState(existingMeasurement?.length?.toString() || '')
  const [notes, setNotes] = useState(existingMeasurement?.notes || '')
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  async function handleDecision(decision: 'valid' | 'remeasure') {
    setLoading(true)
    try {
      // Save measurement
      await supabase.from('measurements').insert({
        order_id: order.id,
        chest: parseFloat(chest) || null,
        shoulder: parseFloat(shoulder) || null,
        sleeve: parseFloat(sleeve) || null,
        length: parseFloat(length) || null,
        notes,
      })

      if (decision === 'valid') {
        // Emit event via database function
        await supabase.rpc('emit_event', {
          p_order_id: order.id,
          p_event_type: 'measurement.completed',
          p_event_data: { chest, shoulder, sleeve, length, notes },
          p_user_id: userId,
        })

        // Create quotation queue task
        await supabase.rpc('create_queue_task', {
          p_order_id: order.id,
          p_queue_type: 'quotation',
        })

        // Mark measurement task as completed
        await supabase
          .from('queue_assignments')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('order_id', order.id)
          .eq('queue_type', 'measurement')

        router.push('/command-center')
      } else {
        // Re-measure: emit event and stay
        await supabase.rpc('emit_event', {
          p_order_id: order.id,
          p_event_type: 'measurement.rejected',
          p_event_data: { reason: 'Ukuran perlu diulang', notes },
          p_user_id: userId,
        })
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = chest && shoulder && sleeve && length

  return (
    <div className="min-h-screen bg-surface">

      {/* Top Navigation */}
      <div className="border-b border-outline-variant">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-secondary hover:text-on-surface transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-label text-secondary uppercase tracking-widest">
            Workspace · Measurement
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 animate-slide-up">

        {/* ZONE 1: HEADER */}
        <WorkspaceHeader
          customerName={order.customers.name}
          orderNumber={order.order_number}
          currentState="measurement"
          stateLabel="Step 4 dari 11"
        />

        {/* ZONE 2: CONTEXT */}
        {existingMeasurement && (
          <div className="mt-8 pl-4 border-l-2 border-outline-variant">
            <p className="zone-label">Ukuran Sebelumnya</p>
            <div className="grid grid-cols-2 gap-3 text-body text-secondary">
              <span>Dada: {existingMeasurement.chest} cm</span>
              <span>Bahu: {existingMeasurement.shoulder} cm</span>
              <span>Lengan: {existingMeasurement.sleeve} cm</span>
              <span>Panjang: {existingMeasurement.length} cm</span>
            </div>
            {existingMeasurement.notes && (
              <p className="text-body text-secondary mt-2 italic">
                {existingMeasurement.notes}
              </p>
            )}
          </div>
        )}

        {/* ZONE 3: TASK */}
        <div className="mt-10">
          <p className="zone-label">Ukuran</p>

          <div className="grid grid-cols-2 gap-8">
            {[
              { label: 'Dada', value: chest, set: setChest, placeholder: '42' },
              { label: 'Bahu', value: shoulder, set: setShoulder, placeholder: '46' },
              { label: 'Lengan', value: sleeve, set: setSleeve, placeholder: '62' },
              { label: 'Panjang', value: length, set: setLength, placeholder: '145' },
            ].map(field => (
              <div key={field.label}>
                <label className="zone-label block mb-2">{field.label} (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full border-b border-outline-variant bg-transparent py-3
                             text-headline font-light text-on-surface outline-none
                             focus:border-primary transition-colors duration-200
                             placeholder:text-secondary/30"
                />
              </div>
            ))}
          </div>

          <div className="mt-8">
            <label className="zone-label block mb-2">Catatan</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Preferensi fit, bentuk tubuh khusus, permintaan customer..."
              className="w-full border-b border-outline-variant bg-transparent py-3
                         text-body text-on-surface outline-none resize-none
                         focus:border-primary transition-colors duration-200
                         placeholder:text-secondary/30"
            />
          </div>
        </div>

        {/* ZONE 4: DECISION */}
        <div className="mt-12 pt-8 border-t border-outline-variant">
          <p className="zone-label mb-6">Keputusan</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleDecision('valid')}
              disabled={!isFormValid || loading}
              className="decision-primary flex items-center justify-center gap-2
                         disabled:opacity-40 disabled:cursor-not-allowed flex-1"
            >
              <CheckCircle size={16} />
              Ukuran Valid — Lanjut ke Quotation
            </button>

            <button
              onClick={() => handleDecision('remeasure')}
              disabled={loading}
              className="decision-secondary flex items-center justify-center gap-2
                         disabled:opacity-40 flex-1"
            >
              <RotateCcw size={16} />
              Perlu Diukur Ulang
            </button>
          </div>

          <p className="text-label text-secondary mt-4">
            Klik keputusan di atas untuk mencatat hasil dan lanjutkan workflow.
          </p>
        </div>

        {/* ZONE 5: HISTORY */}
        <div className="mt-12">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-label text-secondary uppercase tracking-widest
                       flex items-center gap-2 hover:text-on-surface transition-colors"
          >
            Riwayat · {events.length} event
            <span className="text-xs">{showHistory ? '▲' : '▼'}</span>
          </button>

          {showHistory && (
            <EventHistory events={events} />
          )}
        </div>
      </div>
    </div>
  )
}
