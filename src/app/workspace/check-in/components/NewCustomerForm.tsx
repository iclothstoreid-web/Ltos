'use client'

import { useState } from 'react'
import { createNewCustomer } from '../actions'
import type { Customer } from '../types'

interface NewCustomerFormProps {
  onSuccess: (customer: Customer) => void
  onCancel: () => void
}

export function NewCustomerForm({ onSuccess, onCancel }: NewCustomerFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { success, error, customer } = await createNewCustomer(
      name,
      phone,
      address || undefined
    )

    if (!success || !customer) {
      setError(error || 'Gagal membuat customer')
      setLoading(false)
      return
    }

    onSuccess(customer)
  	setLoading(false)
  }

  return (
    <div className="p-16 max-w-lg mx-auto animate-fade-in">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="material-symbols-outlined text-6xl text-[#775a19]/30 mb-6">
          person_add
        </span>
        <p className="font-sans text-xs uppercase tracking-widest text-[#444748] mb-2">
          Customer Baru
        </p>
        <h2 className="font-fraunces text-4xl text-[#151c27]">Buat Profil Bespoke</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30">
            <p className="font-sans text-sm text-[#ba1a1a]">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <label className="block">
            <span className="font-sans text-xs text-[#444748] uppercase tracking-widest">Nama</span>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full mt-2 border-b border-[#c4c7c7] bg-transparent py-3 font-sans
                         text-base text-[#151c27] outline-none focus:border-[#775a19] transition-colors"
            />
          </label>

          <label className="block">
            <span className="font-sans text-xs text-[#444748] uppercase tracking-widest">Nomor HP</span>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="w-full mt-2 border-b border-[#c4c7c7] bg-transparent py-3 font-sans
                         text-base text-[#151c27] outline-none focus:border-[#775a19] transition-colors"
            />
          </label>

          <label className="block">
            <span className="font-sans text-xs text-[#444748] uppercase tracking-widest">Alamat (opsional)</span>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full mt-2 border-b border-[#c4c7c7] bg-transparent py-3 font-sans
                         text-base text-[#151c27] outline-none focus:border-[#775a19] transition-colors"
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-[#c4c7c7]">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#151c27] text-white rounded-lg py-3 font-sans text-sm font-bold
                       hover:bg-[#775a19] transition-all duration-300 disabled:opacity-40"
          >
            {loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-[#c4c7c7] rounded-lg py-3 font-sans text-sm
                       text-[#444748] hover:text-[#151c27] hover:border-[#151c27] transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

