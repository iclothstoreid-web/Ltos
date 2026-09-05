'use client'

import { useEffect, useState } from 'react'
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
import { resumeRouteForConsultation, type Customer, type FitterOrder, type RecentConsultation } from './types'

type ViewState = 'search' | 'profile' | 'new-customer' | 'success'

interface CheckInPageClientProps {
  // Sprint O.2 (CLS fix) — fetched server-side by page.tsx so
  // CustomerSearch's "Order Monitoring" / "Konsultasi Terakhir" lists exist
  // on first paint instead of popping in after a client-side fetch, which
  // was pushing "Aksi Cepat" and ConsultationInsights down mid-load (CLS
  // 0.44). Same actions, same limits (10/5) CustomerSearch already called
  // client-side — only the fetch timing moved.
  initialFitterOrders: FitterOrder[]
  initialRecentConsultations: RecentConsultation[]
  // Fetch Strategy (STEP 5.1) — same shape as initialRecentConsultations
  // above, fetched server-side with limit 50 for ConsultationInsights' stat
  // cards instead of it fetching client-side on mount.
  initialInsightsConsultations: RecentConsultation[]
  // Query Optimization (STEP 2, P1) — computed server-side in page.tsx via
  // getCurrentRole(), passed through to CheckInSidebar instead of it
  // querying role itself.
  showMasterData: boolean
}

export default function CheckInPageClient({
  initialFitterOrders,
  initialRecentConsultations,
  initialInsightsConsultations,
  showMasterData,
}: CheckInPageClientProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [view, setView] = useState<ViewState>('search')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [fitter, setFitter] = useState<Operator | null>(null)
  const [creating, setCreating] = useState(false)
  const [resolvingCustomer, setResolvingCustomer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [successData, setSuccessData] = useState<{
    consultationId: string
    consultationNumber: string
    customerName: string
    customerPhone: string | null
    customerConsultationToken: string | null
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

    const { success, error: createError, consultationId, consultationNumber, customerConsultationToken } =
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
      customerPhone: selectedCustomer.phone,
      customerConsultationToken,
    })
    setView('success')
    setCreating(false)
  }

  // Fetch Strategy (STEP 5.3, prefetch) — the Design Studio route is
  // already known as soon as the session is created, but the user still
  // reads the success screen before tapping "Lanjutkan ke Design Studio".
  // Prefetching as soon as that route is known (instead of waiting for the
  // click) uses that reading time to warm the RSC payload.
  //
  // SELL FIRST -> MEASURE AFTER: a freshly created consultation now opens
  // Design Studio first (product selection), not Measurement — see
  // resumeRouteForConsultation in ./types.ts for the full flow-order map.
  useEffect(() => {
    if (successData) {
      router.prefetch(`/workspace/design-studio/${successData.consultationId}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successData])

  const handleBackToSearch = () => {
    setView('search')
    setSelectedCustomer(null)
    setFitter(null)
    setSuccessData(null)
    setError(null)
  }

  const handleContinueToDesignStudio = () => {
    if (!successData) return
    router.push(`/workspace/design-studio/${successData.consultationId}`)
  }

  return (
    // Brand System Upgrade — real walnut wood-grain texture, replacing the
    // gold diamond-sparkle data-URI, for consistency with every other LTOS
    // app's now-shared .atelier-bg texture.
    <div
      className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full overflow-x-hidden lg:overflow-hidden bg-[#FDFCF8] text-[#151c27] antialiased"
      style={{
        backgroundImage: "url('/textures/walnut-grain.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '512px 512px',
      }}
    >
      <CheckInSidebar
        showMasterData={showMasterData}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <main
        className={`flex-1 flex flex-col lg:overflow-hidden relative ${
          view === 'success'
            ? 'pb-40 lg:pb-0'
            : view === 'profile'
              ? 'pb-56 lg:pb-0'
              : ''
        }`}
      >
        <CheckInHeader onMenuClick={() => setMobileNavOpen(true)} />

        <div className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden">
          <CustomerSearch
            expanded={view === 'search'}
            onSelectCustomer={handleSelectCustomer}
            onNewCustomer={handleNewCustomer}
            initialFitterOrders={initialFitterOrders}
            initialRecentConsultations={initialRecentConsultations}
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
                  customerPhone={successData.customerPhone}
                  customerConsultationToken={successData.customerConsultationToken}
                  onBackToSearch={handleBackToSearch}
                />
              )}
            </section>
          )}

          <ConsultationInsights initialConsultations={initialInsightsConsultations} />
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
            primaryLabel="Lanjutkan ke Design Studio"
            onPrimaryAction={handleContinueToDesignStudio}
          />
        )}
      </main>
    </div>
  )
}
