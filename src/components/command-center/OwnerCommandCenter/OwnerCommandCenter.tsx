'use client'

import { useEffect, useState } from 'react'
import { LeftSidebar } from './LeftSidebar'
import { OwnerTopBar } from './OwnerTopBar'
import { ExecutiveBriefing } from './ExecutiveBriefing'
import { QuietLedger } from './QuietLedger'
import { ProductionLiveKanban } from './ProductionLiveKanban'
import { AgendaPanel, AgendaItem } from './AgendaPanel'
import type { EngineOverviewSectionProps } from './EngineOverviewSection'
import type { BottleneckItem } from './BottleneckPanel'
import type {
  OperationalAlertCardData,
  CommercialAlertCardData,
  InventoryAlertCardData,
  BusinessInsightCardData,
} from '@/lib/decision/types'
import type { CommercialTypeSummaryRow } from '@/lib/commercial/transactionSummary'
import type { MultiGarmentKpiData } from '@/lib/commercial/multiGarmentKPIs'

export type OwnerCommandCenterProps = {
  profileName: string
  todayLabel: string
  engineOverview: EngineOverviewSectionProps
  summary: {
    revenueToday: number
    revenueThisMonth: number
    activeOrders: number
    productionToday: number
    qcToday: number
  }
  crmSnapshot: {
    newLeads: number
    consultationsToday: number
    waitingQuotation: number
    waitingDp: number
    followUpToday: number
    vipCustomers: number
  }
  bottleneckItems: BottleneckItem[]
  executiveBrief: {
    recommendationTitle: string
    recommendationBody: string
    hasRecommendation: boolean
  }
  productionColumns: {
    waiting: Array<{ id: string; order: string; customer: string }>
    cutting: Array<{ id: string; order: string; customer: string }>
    sewing: Array<{ id: string; order: string; customer: string }>
    qc: Array<{ id: string; order: string; customer: string }>
    ready: Array<{ id: string; order: string; customer: string }>
  }
  artisanCards: Array<{
    id: string
    name: string
    role: string
    workload: string
    capacity: string
    qualityScore: string
  }>
  agendaItems: AgendaItem[]
  // Sprint N.1 — Owner Decision Layer V1
  decisionCards: {
    operationalAlert: OperationalAlertCardData
    commercialAlert: CommercialAlertCardData
    inventoryAlert: InventoryAlertCardData
    businessInsight: BusinessInsightCardData
  }
  // Milestone A — Commercial Type Engine
  commercialTypeSummary: CommercialTypeSummaryRow[]
  // Milestone B — Multi-Garment Transaction Engine
  multiGarmentKpis: MultiGarmentKpiData
}

// Sprint D.1 Phase 5 — Owner Decision Room implementation. Composition now
// follows the locked Sequence DNA (Design Language Volume 03 SS5, spec SS4):
// Threshold -> Decision (hero) -> Periphery (Quiet Ledger) -> Record
// (Procession + Agenda) -> Close. Every number rendered below still comes
// from the same props CommandCenterPage (src/app/command-center/page.tsx)
// already computed — no new query, RPC, or business rule was added; only
// composition, density, and styling changed. Sections that no longer appear
// in this composition (Engine Overview, Summary Cards, CRM Snapshot,
// Decision Cards, Commercial Type Summary, Transaction KPI, the old boxed
// Bottleneck Panel, Artisan Grid, Clock/Calendar widget) are unchanged files
// elsewhere in this directory; simply no longer rendered on this one screen,
// per the approved Atmosphere DNA ("no dashboard grid of equal-weight
// widgets"). LeftSidebar/OwnerTopBar are shared chrome across six other
// Owner OS pages (Commercial/Decision/KPI Operator/KPI Fitter/Communications
// Center) and are out of this sprint's scope; left unchanged.
export function OwnerCommandCenter({
  profileName,
  todayLabel,
  executiveBrief,
  engineOverview,
  productionColumns,
  agendaItems,
  decisionCards,
}: OwnerCommandCenterProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Close signature clock — mirrors ClockCalendar's hydration-safe pattern
  // (starts null, fills in on mount) so server-rendered markup never shows a
  // timestamp that would mismatch the client's first render. Minute-only,
  // not per-second, per Behavior DNA Tempo ("never perform busyness").
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])
  const timeLabel = now ? now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'

  const focusLine = executiveBrief.hasRecommendation
    ? `Fokus utama hari ini: ${executiveBrief.recommendationTitle}.`
    : 'Tidak ada yang memerlukan keputusan Anda hari ini.'

  return (
    <div className="min-h-screen bg-surface-01 text-text-primary flex atelier-bg">
      <LeftSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopBar profileName={profileName} onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-10 max-w-[1200px] w-full mx-auto">
          {/* Threshold */}
          <section className="mb-16 sm:mb-20">
            <p className="text-label text-secondary uppercase tracking-widest">{todayLabel}</p>
            <h1 className="font-serif text-heading-md text-text-primary leading-[1.2] font-normal mt-6">
              Selamat Pagi, {profileName}.
            </h1>
            <p className="text-body-md text-secondary mt-3 leading-relaxed max-w-[55ch]">{focusLine}</p>
            <div className="w-16 h-px bg-warm-gold mt-8" />
          </section>

          {/* The Decision (hero) */}
          <section className="mb-16 sm:mb-24">
            <ExecutiveBriefing
              title={executiveBrief.recommendationTitle}
              body={executiveBrief.recommendationBody}
              hasRecommendation={executiveBrief.hasRecommendation}
            />
          </section>

          {/* Periphery — Quiet Ledger */}
          <section className="mb-14 sm:mb-16">
            <QuietLedger
              commercial={{
                outstandingPayment: engineOverview.commercial.outstandingPayment,
                dpOutstandingCount: engineOverview.commercial.dpOutstandingCount,
                overdueCount: decisionCards.commercialAlert.overdueCount,
              }}
              bottleneck={{
                stage: engineOverview.ownerSummary.bottleneck.most_backlogged_stage,
                count: engineOverview.ownerSummary.bottleneck.most_backlogged_stage_count,
                overSlaCount: engineOverview.ownerSummary.sla_risk.total_over_sla,
              }}
              inventory={{
                lowStockCount: decisionCards.inventoryAlert.lowStockCount,
                outOfStockCount: decisionCards.inventoryAlert.outOfStockCount,
                mostCriticalItem: decisionCards.inventoryAlert.mostCriticalItem,
              }}
            />
          </section>

          {/* Record — Procession + Agenda */}
          <section className="mb-10">
            <ProductionLiveKanban columns={productionColumns} />
          </section>

          <section className="mb-16 sm:mb-20">
            <AgendaPanel items={agendaItems} />
          </section>

          {/* Close */}
          <footer className="border-t border-warm-gold/40 pt-6 flex items-center justify-between gap-4">
            <p className="text-label text-secondary/80 uppercase tracking-widest">LTOS — Owner OS</p>
            <p className="text-label text-secondary/80 tabular-nums">{timeLabel}</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
