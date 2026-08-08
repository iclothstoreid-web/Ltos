import CheckInPageClient from './CheckInPageClient'
import { getFitterOrders, getRecentConsultations } from './actions'
import { getCurrentRole } from '@/lib/rbac/session'
import { canManageMasterData } from '@/lib/design/masterData'

export default async function CheckInPage() {
  // Sprint O.2 (CLS fix) — same actions/limits CustomerSearch previously
  // fetched client-side on mount; fetching here means the page's initial
  // HTML already reflects them, so nothing pops in and pushes layout down
  // after paint.
  //
  // Query Optimization (STEP 2, P1) — role read via getCurrentRole()
  // (middleware-forwarded x-user-role header, zero network calls) instead
  // of CheckInSidebar repeating its own auth.getUser() + profiles.role
  // query client-side.
  // Fetch Strategy (STEP 5.1) — ConsultationInsights previously fetched
  // getRecentConsultations(50) itself in a client useEffect after mount
  // (its 4 stat cards showed "—" until that round trip resolved). Same
  // action, same read-only initial-load data as the two calls below —
  // fetched here instead and passed down as a prop.
  const [{ orders }, { consultations }, { consultations: insightsConsultations }, role] = await Promise.all([
    getFitterOrders(10),
    getRecentConsultations(5),
    getRecentConsultations(50),
    getCurrentRole(),
  ])

  return (
    <CheckInPageClient
      initialFitterOrders={orders}
      initialRecentConsultations={consultations}
      initialInsightsConsultations={insightsConsultations}
      showMasterData={canManageMasterData(role)}
    />
  )
}
