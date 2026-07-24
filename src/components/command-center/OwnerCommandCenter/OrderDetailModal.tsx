'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getProductionPacket } from '@/lib/production/client'
import type { ProductionPacket } from '@/lib/production/types'
import { STAGE_ORDER, STAGE_LABELS, getCurrentStageRecord } from '@/lib/production/stageConfig'
import { FIELD_LABELS, CUTTING_MODEL_LABELS, WRIST_FINISHING_LABELS } from '@/components/workspace/measurement/types'
import type { MeasurementKey } from '@/components/workspace/measurement/types'
import { markOrderDelivered } from '@/lib/order/delivery'
import { OrderCommercialSection } from './OrderCommercialSection'

interface OrderDetailModalProps {
  orderId: string
  onClose: () => void
}

interface ActivityEvent {
  event_type: string
  created_at: string
}

const STAGE_STATUS_DOT: Record<string, string> = {
  completed: 'bg-[#161b29]',
  in_progress: 'bg-[#775a19] animate-pulse',
  pending: 'bg-[#dce2f3] border border-[#c4c7c7]',
}

function humanizeEventType(eventType: string): string {
  return eventType
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Owner OS's "Detail Order" overlay — opened by clicking a customer row in
// BottleneckPanel. get_production_packet already assembles almost everything
// needed (customer/design/measurements incl. Cutting Model + Finishing
// Pergelangan, stage records, estimated completion) in one call; Riwayat
// aktivitas is a separate business_events read, same source
// ProductionJourneyTimeline uses elsewhere for the pre-production journey.
export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const [supabase] = useState(() => createClient())
  const [packet, setPacket] = useState<ProductionPacket | null>(null)
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingDelivered, setMarkingDelivered] = useState(false)
  const [deliveredError, setDeliveredError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [packetResult, eventsResult] = await Promise.all([
        getProductionPacket(supabase, orderId),
        supabase
          .from('business_events')
          .select('event_type, created_at')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false }),
      ])
      setPacket(packetResult)
      setEvents((eventsResult.data as ActivityEvent[]) || [])
    } catch (err) {
      console.error('[command-center] load order detail failed', err)
      setError('Gagal memuat detail order.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, orderId])

  async function handleMarkDelivered() {
    setMarkingDelivered(true)
    setDeliveredError(null)
    try {
      await markOrderDelivered(supabase, orderId)
      await load()
    } catch (err) {
      console.error('[command-center] mark delivered failed', err)
      setDeliveredError('Gagal menandai order Delivered. Pastikan tahap Pengiriman sudah selesai.')
    } finally {
      setMarkingDelivered(false)
    }
  }

  const currentRecord = packet ? getCurrentStageRecord(packet.stage_records) : null
  const statusLabel = !packet
    ? '—'
    : currentRecord
      ? `${STAGE_LABELS[currentRecord.stage]} · ${currentRecord.status === 'in_progress' ? 'Sedang Dikerjakan' : 'Menunggu'}`
      : packet.stage_records.length > 0
        ? 'Order Selesai'
        : 'Belum Dimulai'

  const measurements = packet?.locked_measurements
  const shippingCompleted = !!packet?.stage_records.some(
    r => r.stage === 'shipping' && r.status === 'completed'
  )
  const isDelivered = packet?.current_state === 'follow_up'

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-sm shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-[#e5e5e0] z-10">
          <h2 className="font-hanken text-sm uppercase tracking-widest text-[#161b29]">Detail Order</h2>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <X size={18} className="text-[#46464c]" />
          </button>
        </div>

        {loading && <p className="px-6 py-10 text-center font-hanken text-sm text-[#46464c]">Memuat...</p>}
        {error && <p className="px-6 py-10 text-center font-hanken text-sm text-[#c0392b]">{error}</p>}

        {!loading && !error && packet && (
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Nama Customer</p>
                <p className="font-hanken text-sm text-[#161b29]">{packet.customer_name || '—'}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Nomor Order</p>
                <p className="font-hanken text-sm text-[#161b29]">{packet.order_number}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Status</p>
                <p className="font-hanken text-sm text-[#161b29]">{statusLabel}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Estimasi Selesai</p>
                <p className="font-hanken text-sm text-[#161b29]">{formatDate(packet.estimated_completion)}</p>
              </div>
            </div>

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">
                Status Pengiriman
              </p>
              {deliveredError && <p className="font-hanken text-xs text-[#c0392b] mb-2">{deliveredError}</p>}
              {isDelivered ? (
                <p className="font-hanken text-sm text-[#1f6b2c] font-semibold">Delivered — sudah diterima customer</p>
              ) : shippingCompleted ? (
                <button
                  type="button"
                  onClick={handleMarkDelivered}
                  disabled={markingDelivered}
                  className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
                >
                  {markingDelivered ? 'Menandai...' : 'Tandai Sudah Diterima Customer'}
                </button>
              ) : (
                <p className="font-hanken text-xs text-[#46464c]">
                  Tahap Pengiriman belum selesai — belum dapat ditandai Delivered.
                </p>
              )}
            </div>

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-3">
                Timeline Produksi
              </p>
              <div className="flex flex-wrap gap-3">
                {STAGE_ORDER.map(stage => {
                  const records = packet.stage_records.filter(r => r.stage === stage)
                  const latest = records.length
                    ? [...records].sort((a, b) => b.attempt - a.attempt)[0]
                    : null
                  const status = latest?.status ?? 'pending'
                  return (
                    <div key={stage} className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${STAGE_STATUS_DOT[status]}`} />
                      <span className="font-hanken text-xs text-[#46464c]">{STAGE_LABELS[stage]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">
                Measurement Summary
              </p>
              {measurements ? (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-hanken text-xs text-[#46464c]">
                    {(Object.keys(FIELD_LABELS) as Array<MeasurementKey>).map(key => (
                      <span key={key}>
                        {FIELD_LABELS[key]}: {measurements[key] || '—'} cm
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-6 font-hanken text-xs text-[#161b29]">
                    <span>
                      Cutting Model:{' '}
                      <strong>
                        {measurements.cuttingModel ? CUTTING_MODEL_LABELS[measurements.cuttingModel] : '—'}
                      </strong>
                    </span>
                    <span>
                      Finishing Pergelangan:{' '}
                      <strong>
                        {measurements.wristFinishing
                          ? WRIST_FINISHING_LABELS[measurements.wristFinishing]
                          : '—'}
                      </strong>
                    </span>
                  </div>
                </>
              ) : (
                <p className="font-hanken text-xs text-[#46464c]">Belum ada data pengukuran.</p>
              )}
            </div>

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Catatan</p>
              <p className="font-hanken text-sm text-[#161b29] whitespace-pre-wrap">
                {packet.consultation_notes || '—'}
              </p>
            </div>

            <OrderCommercialSection orderId={orderId} />

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">
                Riwayat Aktivitas
              </p>
              {events.length === 0 ? (
                <p className="font-hanken text-xs text-[#46464c]">Belum ada aktivitas tercatat.</p>
              ) : (
                <ul className="space-y-2">
                  {events.map((e, i) => (
                    <li key={`${e.event_type}-${i}`} className="flex items-center justify-between">
                      <span className="font-hanken text-xs text-[#161b29]">{humanizeEventType(e.event_type)}</span>
                      <span className="font-hanken text-[10px] text-[#46464c]">{formatDate(e.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
