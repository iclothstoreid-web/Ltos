'use client'

import { useState, useCallback, useEffect } from 'react'
import { searchCustomers, getRecentConsultations, getCustomerById } from '../actions'
import type { Customer, RecentConsultation } from '../types'
import { CustomerCard } from './CustomerCard'

const STATUS_LABELS: Record<string, string> = {
  check_in: 'Check-In',
  waiting_measurement: 'Menunggu Ukur',
  measurement: 'Pengukuran',
  design: 'Desain',
  review: 'Review',
  order_created: 'Order Dibuat',
  cancelled: 'Batal',
}

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer) => void
  onNewCustomer: () => void
}

export function CustomerSearch({
  onSelectCustomer,
  onNewCustomer,
}: CustomerSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      const { consultations } = await getRecentConsultations(5)
      setRecentConsultations(consultations)
      setLoadingRecent(false)
    }
    fetchRecent()
  }, [])

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery)

      if (searchQuery.length < 2) {
        setResults([])
        setShowResults(false)
        return
      }

      setLoading(true)
      const { customers, error } = await searchCustomers(searchQuery)

      if (!error) {
        setResults(customers)
        setShowResults(true)
      }
      setLoading(false)
    },
    []
  )

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer)
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  // "Konsultasi Terakhir" rows only carry a partial customer join
  // ({id, name, phone}) — fetch the full record via the same
  // getCustomerById action NewCustomerForm/ConsultationHistory already use,
  // then reuse handleSelectCustomer's existing selection path.
  const handleSelectRecent = async (consultation: RecentConsultation) => {
    if (!consultation.customers) return
    const { customer } = await getCustomerById(consultation.customers.id)
    if (customer) handleSelectCustomer(customer)
  }

  return (
    <section className="w-full lg:w-[30%] border-b lg:border-b-0 lg:border-r-[0.5px] border-[#c4c7c7] flex flex-col bg-white/40 lg:h-full">
      <div className="p-8 pb-4">
        <div className="relative group">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#747878] transition-colors group-focus-within:text-[#775a19]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Nama, nomor HP, atau alamat..."
            className="w-full pl-8 pr-4 py-4 bg-transparent border-b border-[#c4c7c7]
                       focus:border-[#775a19] focus:ring-0 font-sans text-base
                       text-[#151c27] placeholder:text-[#444748]/40 outline-none
                       transition-colors duration-300"
          />
          {loading && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-[#775a19] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-4">
        {showResults && results.length > 0 && (
          <div className="space-y-4">
            {results.map(customer => (
              <CustomerCard
                key={customer.id}
                name={customer.name}
                phone={customer.phone}
                subtitle={customer.address}
                badge={customer.is_preferred_client ? 'PREFERRED' : null}
                onClick={() => handleSelectCustomer(customer)}
              />
            ))}
          </div>
        )}

        {showResults && query.length >= 2 && results.length === 0 && !loading && (
          <div className="p-6 text-center rounded-xl bg-white border border-[#c4c7c7]/40">
            <p className="font-sans text-sm text-[#444748] mb-4">
              Pelanggan tidak ditemukan
            </p>
            <button
              onClick={onNewCustomer}
              className="font-sans text-xs font-semibold text-[#775a19] hover:underline uppercase tracking-widest"
            >
              Buat pelanggan baru
            </button>
          </div>
        )}

        {!showResults && (
          <div className="space-y-6">
            {!loadingRecent && recentConsultations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-sans text-xs uppercase tracking-widest text-[#444748] flex justify-between items-center">
                  Konsultasi Terakhir
                  <span className="bg-[#e2e8f8] px-2 py-0.5 rounded-full text-[10px]">
                    {recentConsultations.length} Aktif
                  </span>
                </h3>
                <div className="space-y-2">
                  {recentConsultations.map(consultation => (
                    <button
                      key={consultation.id}
                      type="button"
                      onClick={() => handleSelectRecent(consultation)}
                      disabled={!consultation.customers}
                      className="w-full text-left p-4 rounded-lg bg-white border border-[#c4c7c7]/30
                                 transition-all duration-300 hover:bg-white/60 hover:border-[#c4c7c7]
                                 disabled:cursor-default disabled:hover:bg-white disabled:hover:border-[#c4c7c7]/30"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-sans text-sm font-semibold text-[#151c27]">
                            {consultation.customers?.name}
                          </p>
                          <p className="font-sans text-xs text-[#444748] mt-1">
                            {consultation.consultation_number}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded uppercase font-semibold tracking-widest ${
                            consultation.status === 'order_created'
                              ? 'bg-[#fed488]/40 text-[#785a1a]'
                              : 'bg-[#775a19]/10 text-[#775a19]'
                          }`}
                        >
                          {STATUS_LABELS[consultation.status] || consultation.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <p className="font-sans text-xs uppercase tracking-widest text-[#444748]">
                Aksi Cepat
              </p>
              <button
                onClick={onNewCustomer}
                className="w-full bg-[#151c27] text-white px-6 py-3 rounded-lg font-sans text-sm
                           font-semibold hover:bg-[#775a19] transition-all duration-300"
              >
                + Pelanggan Baru
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}