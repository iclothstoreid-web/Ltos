import CheckInPageClient from './CheckInPageClient'
import { getFitterOrders, getRecentConsultations } from './actions'

export default async function CheckInPage() {
  // Sprint O.2 (CLS fix) — same actions/limits CustomerSearch previously
  // fetched client-side on mount; fetching here means the page's initial
  // HTML already reflects them, so nothing pops in and pushes layout down
  // after paint.
  const [{ orders }, { consultations }] = await Promise.all([
    getFitterOrders(10),
    getRecentConsultations(5),
  ])

  return (
    <CheckInPageClient
      initialFitterOrders={orders}
      initialRecentConsultations={consultations}
    />
  )
}
