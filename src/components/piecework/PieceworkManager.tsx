'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Plus, Save, WalletCards } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  createPieceworkRate,
  updatePieceworkRate,
  updatePieceworkWeekStatus,
} from '@/lib/piecework/client'
import type {
  PieceworkEntry,
  PieceworkPayrollWeek,
  PieceworkRate,
  PieceworkRateType,
  PieceworkStage,
} from '@/lib/piecework/types'

const STAGE_LABEL: Record<PieceworkStage, string> = {
  cutting: 'Cutting',
  sewing: 'Jahit',
}

const DESIGN_FIELDS = [
  'collar',
  'cuff',
  'plaket',
  'pocket',
  'button',
  'embroidery',
  'handmadeZigzag',
] as const

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

interface Props {
  initialRates: PieceworkRate[]
  initialWeeks: PieceworkPayrollWeek[]
  initialEntries: PieceworkEntry[]
}

export function PieceworkManager({ initialRates, initialWeeks, initialEntries }: Props) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [rates, setRates] = useState(initialRates)
  const [weeks, setWeeks] = useState(initialWeeks)
  const [tab, setTab] = useState<'rates' | 'weekly'>('weekly')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [draftAmounts, setDraftAmounts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const [stage, setStage] = useState<PieceworkStage>('sewing')
  const [rateType, setRateType] = useState<PieceworkRateType>('base')
  const [modelName, setModelName] = useState('')
  const [designField, setDesignField] = useState<(typeof DESIGN_FIELDS)[number]>('pocket')
  const [optionValue, setOptionValue] = useState('')
  const [amount, setAmount] = useState('0')

  const entriesByWeekOperator = useMemo(() => {
    const map = new Map<string, PieceworkEntry[]>()
    for (const entry of initialEntries) {
      const key = `${entry.payroll_week_start}:${entry.operator_id}`
      const list = map.get(key) || []
      list.push(entry)
      map.set(key, list)
    }
    return map
  }, [initialEntries])

  async function addRate() {
    setError(null)
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      setError('Nominal harga tidak valid.')
      return
    }
    if (rateType === 'base' && !modelName.trim()) {
      setError('Nama model wajib untuk harga basic.')
      return
    }
    if (rateType === 'addon' && !optionValue.trim()) {
      setError('Nama opsi/detail wajib untuk harga tambahan.')
      return
    }

    try {
      const created = await createPieceworkRate(supabase, {
        stage,
        rateType,
        modelName: modelName.trim() || null,
        designField: rateType === 'addon' ? designField : null,
        optionValue: rateType === 'addon' ? optionValue.trim() : null,
        amount: numericAmount,
      })
      setRates(prev => [...prev, created])
      setModelName('')
      setOptionValue('')
      setAmount('0')
    } catch (err) {
      console.error(err)
      setError('Gagal menambah harga. Pastikan kombinasi harga belum ada.')
    }
  }

  async function saveAmount(rate: PieceworkRate) {
    const next = Number(draftAmounts[rate.id] ?? rate.amount)
    if (!Number.isFinite(next) || next < 0) return
    setSavingId(rate.id)
    setError(null)
    try {
      const updated = await updatePieceworkRate(supabase, rate.id, { amount: next })
      setRates(prev => prev.map(item => (item.id === rate.id ? updated : item)))
      setDraftAmounts(prev => {
        const copy = { ...prev }
        delete copy[rate.id]
        return copy
      })
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan perubahan harga.')
    } finally {
      setSavingId(null)
    }
  }

  async function toggleRate(rate: PieceworkRate) {
    setSavingId(rate.id)
    setError(null)
    try {
      const updated = await updatePieceworkRate(supabase, rate.id, { is_active: !rate.is_active })
      setRates(prev => prev.map(item => (item.id === rate.id ? updated : item)))
    } catch (err) {
      console.error(err)
      setError('Gagal mengubah status harga.')
    } finally {
      setSavingId(null)
    }
  }

  async function setWeekStatus(week: PieceworkPayrollWeek, status: 'ready' | 'paid') {
    setSavingId(week.id)
    setError(null)
    try {
      const updated = await updatePieceworkWeekStatus(supabase, week.id, status)
      setWeeks(prev => prev.map(item => (item.id === week.id ? updated : item)))
    } catch (err) {
      console.error(err)
      setError('Gagal memperbarui status pembayaran.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#151c27]">
      <header className="border-b border-[#d9d9df] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#755b00]">Production Payroll</p>
            <h1 className="font-fraunces text-2xl">Borongan Cutting & Jahit</h1>
            <p className="mt-1 text-xs text-[#5f6368]">
              Scan selesai produksi otomatis masuk ledger dan rekap Senin-Sabtu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/owner/master-data-center')}
            className="flex items-center gap-2 text-xs font-medium text-[#755b00]"
          >
            <ArrowLeft size={16} /> Master Data
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex gap-2 rounded-xl bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setTab('weekly')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold ${tab === 'weekly' ? 'bg-[#151c27] text-white' : 'text-[#5f6368]'}`}
          >
            Rekap Mingguan
          </button>
          <button
            type="button"
            onClick={() => setTab('rates')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold ${tab === 'rates' ? 'bg-[#151c27] text-white' : 'text-[#5f6368]'}`}
          >
            Harga Borongan
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {tab === 'weekly' ? (
          <section className="space-y-4">
            {weeks.length === 0 ? (
              <div className="rounded-xl border border-[#d9d9df] bg-white p-8 text-center">
                <WalletCards className="mx-auto mb-3 text-[#755b00]" />
                <p className="font-semibold">Belum ada hasil borongan.</p>
                <p className="mt-1 text-sm text-[#5f6368]">
                  Data pertama akan muncul otomatis setelah stage Cutting atau Jahit selesai.
                </p>
              </div>
            ) : (
              weeks.map(week => {
                const details = entriesByWeekOperator.get(`${week.payroll_week_start}:${week.operator_id}`) || []
                return (
                  <article key={week.id} className="overflow-hidden rounded-xl border border-[#d9d9df] bg-white">
                    <div className="flex flex-col gap-3 border-b border-[#ececf1] p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold">{week.operator_name}</p>
                        <p className="text-xs text-[#5f6368]">
                          {week.payroll_week_start} s/d {week.payroll_week_end} · {week.piece_count} pcs
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xl font-bold">{rupiah(week.total_amount)}</p>
                        <p className="text-[11px] uppercase tracking-wider text-[#755b00]">{week.status}</p>
                      </div>
                    </div>

                    <div className="divide-y divide-[#ececf1]">
                      {details.map(entry => (
                        <div key={entry.id} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 text-sm">
                          <div>
                            <p className="font-medium">{entry.order_number} · {STAGE_LABEL[entry.stage]}</p>
                            <p className="text-xs text-[#5f6368]">
                              {entry.model_name || 'Model belum terbaca'} · Basic {rupiah(entry.base_amount)} + Detail {rupiah(entry.addon_amount)}
                            </p>
                          </div>
                          <p className="font-semibold">{rupiah(entry.total_amount)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 bg-[#fafafc] p-4">
                      {week.status === 'running' && (
                        <button
                          type="button"
                          disabled={savingId === week.id}
                          onClick={() => setWeekStatus(week, 'ready')}
                          className="rounded-lg border border-[#755b00] px-4 py-2 text-xs font-semibold text-[#755b00] disabled:opacity-50"
                        >
                          Finalisasi Minggu
                        </button>
                      )}
                      {week.status === 'ready' && (
                        <button
                          type="button"
                          disabled={savingId === week.id}
                          onClick={() => setWeekStatus(week, 'paid')}
                          className="flex items-center gap-2 rounded-lg bg-[#151c27] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} /> Tandai Dibayar
                        </button>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </section>
        ) : (
          <section className="space-y-5">
            <div className="rounded-xl border border-[#d9d9df] bg-white p-5">
              <h2 className="font-semibold">Tambah Harga Borongan</h2>
              <p className="mb-4 mt-1 text-xs text-[#5f6368]">
                Nominal boleh 0 dulu. Harga yang aktif akan disnapshot saat pekerjaan selesai.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <select value={stage} onChange={e => setStage(e.target.value as PieceworkStage)} className="rounded-lg border p-2 text-sm">
                  <option value="cutting">Cutting</option>
                  <option value="sewing">Jahit</option>
                </select>

                <select value={rateType} onChange={e => setRateType(e.target.value as PieceworkRateType)} className="rounded-lg border p-2 text-sm">
                  <option value="base">Basic Model</option>
                  <option value="addon">Tambahan Detail</option>
                </select>

                <input
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  placeholder={rateType === 'base' ? 'Model: Saudi/Qatari/Dubai' : 'Model khusus (opsional)'}
                  className="rounded-lg border p-2 text-sm"
                />

                {rateType === 'addon' ? (
                  <div className="flex gap-2">
                    <select value={designField} onChange={e => setDesignField(e.target.value as typeof designField)} className="min-w-0 flex-1 rounded-lg border p-2 text-sm">
                      {DESIGN_FIELDS.map(field => <option key={field} value={field}>{field}</option>)}
                    </select>
                    <input value={optionValue} onChange={e => setOptionValue(e.target.value)} placeholder="Nama opsi" className="min-w-0 flex-1 rounded-lg border p-2 text-sm" />
                  </div>
                ) : <div />}

                <div className="flex gap-2">
                  <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="min-w-0 flex-1 rounded-lg border p-2 text-sm" />
                  <button type="button" onClick={addRate} className="rounded-lg bg-[#151c27] px-3 text-white"><Plus size={17} /></button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#d9d9df] bg-white">
              {rates.length === 0 ? (
                <p className="p-6 text-sm text-[#5f6368]">Belum ada harga. Tambahkan basic model atau detail di atas.</p>
              ) : (
                <div className="divide-y divide-[#ececf1]">
                  {rates.map(rate => (
                    <div key={rate.id} className="grid gap-3 p-4 sm:grid-cols-[110px_120px_1fr_180px_110px] sm:items-center">
                      <div className="text-xs font-semibold uppercase">{STAGE_LABEL[rate.stage]}</div>
                      <div className="text-xs text-[#5f6368]">{rate.rate_type === 'base' ? 'Basic' : 'Tambahan'}</div>
                      <div>
                        <p className="text-sm font-medium">
                          {rate.rate_type === 'base'
                            ? rate.model_name
                            : `${rate.design_field}: ${rate.option_value}`}
                        </p>
                        {rate.rate_type === 'addon' && rate.model_name && (
                          <p className="text-xs text-[#5f6368]">Khusus model: {rate.model_name}</p>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={draftAmounts[rate.id] ?? String(rate.amount)}
                        onChange={e => setDraftAmounts(prev => ({ ...prev, [rate.id]: e.target.value }))}
                        className="rounded-lg border p-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button type="button" disabled={savingId === rate.id} onClick={() => saveAmount(rate)} className="rounded-lg border p-2 disabled:opacity-50" title="Simpan"><Save size={16} /></button>
                        <button type="button" disabled={savingId === rate.id} onClick={() => toggleRate(rate)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${rate.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {rate.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
