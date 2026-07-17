'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerSearch } from './components/CustomerSearch'
import { CustomerProfile } from './components/CustomerProfile'
import { NewCustomerForm } from './components/NewCustomerForm'
import { ConsultationSuccess } from './components/ConsultationSuccess'
import { CheckInSidebar } from './components/CheckInSidebar'
import { CheckInHeader } from './components/CheckInHeader'
import { ConsultationInsights } from './components/ConsultationInsights'
import { SessionBar } from './components/SessionBar'
import { createConsultationSession } from './actions'
import type { Customer } from './types'

type ViewState = 'search' | 'profile' | 'new-customer' | 'success'

export default function CheckInPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewState>('search')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{
    consultationId: string
    consultationNumber: string
    customerName: string
  } | null>(null)

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setView('profile')
    setError(null)
  }

  const handleNewCustomer = () => {
    setView('new-customer')
    setError(null)
  }

  const handleNewCustomerSuccess = (customer: Customer) => {
    setSelectedCustomer(customer)
    setView('profile')
  }

  const handleCreateSession = async () => {
    if (!selectedCustomer) return

    setCreating(true)
    setError(null)

    const { success, error: createError, consultationId, consultationNumber } =
      await createConsultationSession(selectedCustomer.id)

    if (!success || !consultationId || !consultationNumber) {
      setError(createError)
      setCreating(false)
      return
    }

    setSuccessData({
      consultationId,
      consultationNumber,
      customerName: selectedCustomer.name,
    })
    setView('success')
    setCreating(false)
  }

  const handleBackToSearch = () => {
    setView('search')
    setSelectedCustomer(null)
    setSuccessData(null)
    setError(null)
  }

  const handleContinueToMeasurement = () => {
    if (!successData) return
    router.push(`/workspace/measurement/${successData.consultationId}`)
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-[#FDFCF8] text-[#151c27] antialiased"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l5 15 15 5-15 5-5 15-5-15-15-5 15-5z' fill='%23775a19' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      }}
    >
      <CheckInSidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <CheckInHeader />

        <div className="flex-1 flex overflow-hidden">
          <CustomerSearch
            onSelectCustomer={handleSelectCustomer}
            onNewCustomer={handleNewCustomer}
          />

          <section className="w-[45%] overflow-y-auto bg-[#FDFCF8]/50">
            {view === 'search' && (
              <div className="h-full flex flex-col items-center justify-center p-16 text-center">
                <span className="material-symbols-outlined text-6xl text-[#775a19]/20 mb-6">
                  content_cut
                </span>
                <h2 className="font-fraunces text-3xl text-[#151c27] mb-2">
                  Pilih atau Cari Customer
                </h2>
                <p className="font-sans text-sm text-[#444748] max-w-xs">
                  Gunakan pencarian di panel kiri untuk memulai konsultasi.
                </p>
              </div>
            )}

            {error && (
              <div className="mx-16 mt-8 p-4 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30">
                <p className="font-sans text-sm text-[#ba1a1a]">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="font-sans text-xs text-[#ba1a1a] hover:underline mt-2"
                >
                  Tutup
                </button>
              </div>
            )}

            {view === 'profile' && selectedCustomer && (
              <CustomerProfile customer={selectedCustomer} />
            )}

            {view === 'new-customer' && (
              <NewCustomerForm
                onSuccess={handleNewCustomerSuccess}
                onCancel={() => setView('search')}
              />
            )}

            {view === 'success' && successData && (
              <ConsultationSuccess
                consultationId={successData.consultationId}
                consultationNumber={successData.consultationNumber}
                customerName={successData.customerName}
                onBackToSearch={handleBackToSearch}
              />
            )}
          </section>

          <ConsultationInsights />
        </div>

        {view === 'profile' && selectedCustomer && (
          <SessionBar
            customerName={selectedCustomer.name}
            sessionLabel="Belum ada sesi"
            statusLabel={creating ? 'Membuat...' : 'Siap'}
            primaryLabel={creating ? 'Membuat sesi...' : 'Mulai Konsultasi Baru'}
            onPrimaryAction={handleCreateSession}
            primaryDisabled={creating}
          />
        )}

        {view === 'success' && successData && (
          <SessionBar
            customerName={successData.customerName}
            sessionLabel={successData.consultationNumber}
            statusLabel="Ready"
            primaryLabel="Continue to Measurement"
            onPrimaryAction={handleContinueToMeasurement}
          />
        )}
      </main>
    </div>
  )
}
