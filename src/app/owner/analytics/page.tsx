import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentRole } from '@/lib/rbac/session'
import { getExecutiveKpis, getCroDashboardData } from '@/lib/analytics/dashboardData'
import { ExecutiveDashboard } from '@/components/analytics/ExecutiveDashboard'
import { CroDashboard } from '@/components/analytics/CroDashboard'

export const metadata: Metadata = {
  title: 'Analytics | Local Tailor',
  robots: { index: false, follow: false },
}

// Sprint W9-1 §12 — KPI Dashboard page. Role gating: /owner/* is already
// restricted to owner/admin by src/middleware.ts's ROUTE_RULES — this
// in-page getCurrentRole() check is defense-in-depth, matching the same
// pattern src/app/owner/business-rules/service/page.tsx already uses,
// not a narrower permission than the rest of /owner/*.
export default async function AnalyticsDashboardPage() {
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')

  const supabase = createClient()
  const [executiveKpis, croData] = await Promise.all([getExecutiveKpis(supabase), getCroDashboardData()])

  return (
    <div className="min-h-screen bg-[#f9f9ff] px-4 py-8 font-sans text-[#151c27] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-widest text-[#755b00]">Analytics & CRO</p>
        <h1 className="mt-2 font-fraunces text-2xl">Analytics Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#444748]">
          Visitor, funnel, dan CTA metrics memerlukan GA4 Data API untuk populate — lihat docs/analytics/KPI_DEFINITIONS.md.
          Order, revenue, dan AOV di bawah ini adalah data live dari sistem komersial.
        </p>

        <div className="mt-8">
          <ExecutiveDashboard kpis={executiveKpis} />
        </div>
        <CroDashboard data={croData} />
      </div>
    </div>
  )
}
