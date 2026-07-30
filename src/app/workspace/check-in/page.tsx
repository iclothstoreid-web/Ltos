'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CustomerSearch } from './components/CustomerSearch'
import { CustomerProfile } from './components/CustomerProfile'
import { NewCustomerForm } from './components/NewCustomerForm'
import { ConsultationSuccess } from './components/ConsultationSuccess'
import { CheckInSidebar } from './components/CheckInSidebar'
import { CheckInHeader } from './components/CheckInHeader'
import { ConsultationInsights } from './components/ConsultationInsights'
import { SessionBar } from './components/SessionBar'
import { OperatorAutocomplete } from '@/components/workspace/production/OperatorAutocomplete'
import { FITTER_DIVISI } from '@/lib/fitter/client'
import type { Operator } from '@/lib/production/types'
import { createConsultationSession, findActiveConsultationForCustomer } from './actions'
import { resumeRouteForConsultation, type Customer } from './types'

type ViewState = 'search' | 'profile' | 'new-customer' | 'success'

export default function CheckInPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [view, setView] = useState<ViewState>('search')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [fitter, setFitter] = useState<Operator | null>(null)
  const [creating, setCreating] = useState(false)
  const [resolvingCustomer, setResolvingCustomer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{
    consultationId: string
    consultationNumber: string
    customerName: string
  } | null>(null)

  // "Resume, Don't Recreate" gate — a customer with an unfinished
  // consultation (anything except order_created/cancelled) must resume that
  // exact consultation, never land on the "Mulai Konsultasi Baru" profile
  // view. This is the single entry point both Customer Search results and
  // "Konsultasi Terakhir" clicks funnel through (see CustomerSearch.tsx's
  // handleSelectRecent), so gating here closes the bug at its only source:
  // handleCreateSession/createConsultationSession has no other caller.
  const handleSelectCustomer = async (customer: Customer) => {
    if (resolvingCustomer) return
    setError(null)
    setResolvingCustomer(true)

    const { consultation, error: lookupError } = await findActiveConsultationForCustomer(customer.id)

    if (lookupError) {
      setError(lookupError)
      setResolvingCustomer(false)
      return
    }

    if (consultation) {
      const route = resumeRouteForConsultation(consultation.status, consultation.id)
      // Defensive only: findActiveConsultationForCustomer and
      // resumeRouteForConsultation share TERMINAL_CONSULTATION_STATUSES, so
      // a terminal status should never reach here. If it ever does (future
      // drift), fail open to "start a new consultation" rather than getting
      // stuck with no action.
      if (route) {
        router.push(route)
        return
      }
    }

    setSelectedCustomer(customer)
    setView('profile')
    setResolvingCustomer(false)
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
    if (!selectedCustomer || !fitter) return

    setCreating(true)
    setError(null)

    const { success, error: createError, consultationId, consultationNumber } =
      await createConsultationSession(selectedCustomer.id, fitter.id)

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
    setFitter(null)
    setSuccessData(null)
    setError(null)
  }

  const handleContinueToMeasurement = () => {
    if (!successData) return
    router.push(`/workspace/measurement/${successData.consultationId}`)
  }

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full overflow-x-hidden lg:overflow-hidden bg-[#FDFCF8] text-[#151c27] antialiased"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l5 15 15 5-15 5-5 15-5-15-15-5 15-5z' fill='%23775a19' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      }}
    >
      <CheckInSidebar />

      <main
        className={`flex-1 flex flex-col lg:overflow-hidden relative ${
          view === 'success'
            ? 'pb-40 lg:pb-0'
            : view === 'profile'
              ? 'pb-56 lg:pb-0'
              : ''
        }`}
      >
        <CheckInHeader />

        <div className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden">
          <CustomerSearch
            expanded={view === 'search'}
            onSelectCustomer={handleSelectCustomer}
            onNewCustomer={handleNewCustomer}
          />

          {view !== 'search' && (
            <section className="w-full lg:w-[45%] overflow-visible lg:overflow-y-auto bg-[#FDFCF8]/50">
              {error && (
                <div className="mx-4 lg:mx-16 mt-8 p-4 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30">
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
          )}

          <ConsultationInsights />
        </div>

        {view === 'profile' && selectedCustomer && (
          <SessionBar
            customerName={selectedCustomer.name}
            sessionLabel={fitter ? `Fitter: ${fitter.nama}` : 'Pilih fitter dahulu'}
            statusLabel={creating ? 'Membuat...' : fitter ? 'Siap Konsultasi' : 'Menunggu Fitter'}
            primaryLabel={creating ? 'Membuat sesi...' : 'Mulai Konsultasi Baru'}
            onPrimaryAction={handleCreateSession}
            primaryDisabled={creating || !fitter}
            fitterPicker={
              <OperatorAutocomplete
                supabase={supabase}
                value={fitter}
                onChange={setFitter}
                onReset={() => setFitter(null)}
                divisiHint={FITTER_DIVISI}
                label="Pilih Fitter"
                variant="dark"
                dropUp
              />
            }
          />
        )}

        {view === 'success' && successData && (
          <SessionBar
            customerName={successData.customerName}
            sessionLabel={successData.consultationNumber}
            statusLabel="Siap"
            primaryLabel="Lanjutkan ke Pengukuran"
            onPrimaryAction={handleContinueToMeasurement}
          />
        )}
      </main>
    </div>
  )
}
