'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getFitterKpiDetail } from '@/lib/fitter/client'
import type { FitterKpiDetail } from '@/lib/fitter/types'
import { formatRupiah } from '@/lib/format/money'

function formatPct(pct: number | null): string {
  return pct == null ? '—' : `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

interface FitterDetailModalProps {
  fitterId: string
  onClose: () => void
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function FitterDetailModal({ fitterId, onClose }: FitterDetailModalProps) {
  const [supabase] = useState(() => createClient())
  const [detail, setDetail] = useState<FitterKpiDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getFitterKpiDetail(supabase, fitterId)
        if (!cancelled) setDetail(result)
      } catch (err) {
        console.error('[kpi-operator] load fitter detail failed', err)
        if (!cancelled) setError('Gagal memuat detail fitter.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [supabase, fitterId])

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-sm shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-[#e5e5e0] z-10">
          <h2 className="font-hanken text-sm uppercase tracking-widest text-[#161b29]">Detail Fitter</h2>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <X size={18} className="text-[#46464c]" />
          </button>
        </div>

        {loading && <p className="px-6 py-10 text-center font-hanken text-sm text-[#46464c]">Memuat...</p>}
        {error && <p className="px-6 py-10 text-center font-hanken text-sm text-[#c0392b]">{error}</p>}

        {!loading && !error && detail && (
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Nama</p>
                <p className="font-hanken text-sm text-[#161b29]">{detail.nama}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Status</p>
                <p className="font-hanken text-sm text-[#161b29]">{detail.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Total Konsultasi</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{detail.total_konsultasi}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Selesai</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{detail.konsultasi_selesai}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Order Dibuat</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{detail.order_dibuat}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Closing Rate</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{formatPct(detail.closing_rate_pct)}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Conversion Rate</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{formatPct(detail.conversion_rate_pct)}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Ranking</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">
                  {detail.ranking != null ? `#${detail.ranking}` : '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Revenue</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{formatRupiah(detail.total_revenue)}</p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Average Order</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">
                  {detail.average_order_value != null ? formatRupiah(detail.average_order_value) : '—'}
                </p>
              </div>
              <div>
                <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Repeat Customer</p>
                <p className="font-hanken text-lg text-[#161b29] mt-1">{formatPct(detail.repeat_customer_pct)}</p>
              </div>
            </div>

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Consultation Time</p>
              <p className="font-hanken text-lg text-[#161b29] mt-1">
                {detail.avg_consultation_minutes != null ? `${Math.round(detail.avg_consultation_minutes)} mnt` : '—'}
              </p>
            </div>

            <div>
              <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">
                Riwayat Konsultasi
              </p>
              {detail.riwayat_konsultasi.length === 0 ? (
                <p className="font-hanken text-xs text-[#46464c]">Belum ada riwayat konsultasi.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-hanken min-w-[480px]">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-widest text-[#46464c] border-b border-[#e5e5e0]">
                        <th className="py-2 pr-2">No. Konsultasi</th>
                        <th className="py-2 pr-2">Customer</th>
                        <th className="py-2 pr-2">Status</th>
                        <th className="py-2">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.riwayat_konsultasi.map(item => (
                        <tr key={item.id} className="border-b border-[#f0efe9] last:border-0">
                          <td className="py-2 pr-2 text-[#161b29]">{item.consultation_number}</td>
                          <td className="py-2 pr-2 text-[#46464c]">{item.customer_name || '—'}</td>
                          <td className="py-2 pr-2 text-[#46464c]">{item.status}</td>
                          <td className="py-2 text-[#46464c] whitespace-nowrap">{formatDate(item.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
