'use client'

import { useMemo } from 'react'
import type { Customer } from '../types'
import { ConsultationHistory } from './ConsultationHistory'

interface CustomerProfileProps {
  customer: Customer
}

// Note: the Stitch reference's "bento" grid shows garment-preference fields
// (Fav Model, Fabric, Collar Style, Assigned Artisan) that don't exist in
// this repo's Customer data — inventing that data isn't appropriate for a
// real business app, so this grid shows only fields we actually have.
export function CustomerProfile({ customer }: CustomerProfileProps) {
  const phoneDisplay = useMemo(() => {
    if (!customer.phone) return '—'
    return customer.phone
  }, [customer.phone])

  const firstName = customer.name.split(' ')[0]

  return (
    <div className="p-6 lg:p-16 max-w-2xl mx-auto space-y-8 lg:space-y-12 animate-fade-in">
      <div className="space-y-2">
        <h2 className="font-fraunces text-5xl text-[#151c27]">Selamat Datang Kembali, {firstName}.</h2>
        <p className="font-sans text-lg text-[#444748] font-light">
          Senang bertemu Anda kembali di atelier hari ini.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-[0_12px_24px_-10px_rgba(107,114,128,0.08)] border border-[#c4c7c7]/20 flex gap-8 items-center">
        <div className="w-24 h-24 rounded-full border-4 border-[#775a19]/10 p-1 shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#e2e8f8] flex items-center justify-center">
            <span className="font-fraunces text-3xl text-[#151c27]">
              {customer.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {customer.is_preferred_client && (
              <span className="bg-[#775a19] text-white font-sans text-[10px] px-3 py-1 rounded-full tracking-widest uppercase">
                Pelanggan Prioritas
              </span>
            )}
            <span className="text-[#444748] font-sans text-xs">
              ID: #{customer.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h3 className="font-fraunces text-2xl text-[#151c27] truncate">{customer.name}</h3>
          <div className="flex items-center gap-2 text-[#775a19]">
            <span className="material-symbols-outlined text-lg">chat</span>
            <span className="font-sans text-sm">{phoneDisplay}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-xl border border-[#c4c7c7]/20">
          <span className="font-sans text-xs text-[#444748] uppercase tracking-widest block mb-4">
            Preferensi
          </span>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#775a19]">star</span>
            <span className="font-fraunces text-xl text-[#151c27]">
              {customer.is_preferred_client ? 'VIP' : 'Reguler'}
            </span>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-[#c4c7c7]/20">
          <span className="font-sans text-xs text-[#444748] uppercase tracking-widest block mb-4">
            Alamat
          </span>
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-symbols-outlined text-[#775a19] shrink-0">home</span>
            <span className="font-fraunces text-xl text-[#151c27] truncate">
              {customer.address || '—'}
            </span>
          </div>
        </div>
      </div>

      <ConsultationHistory customerId={customer.id} />
    </div>
  )
}
