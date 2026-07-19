import { LeftSidebar } from './LeftSidebar'
import { OwnerTopBar } from './OwnerTopBar'
import { SummaryCards } from './SummaryCards'
import { CrmSnapshot } from './CrmSnapshot'
import { BottleneckPanel, BottleneckItem } from './BottleneckPanel'
import { ExecutiveBriefing } from './ExecutiveBriefing'
import { ProductionLiveKanban } from './ProductionLiveKanban'
import { ArtisanPerformanceGrid } from './ArtisanPerformanceGrid'
import { AgendaPanel, AgendaItem } from './AgendaPanel'
import { ClockCalendar } from './widgets/ClockCalendar'

export type OwnerCommandCenterProps = {
  profileName: string
  todayLabel: string
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
}

export function OwnerCommandCenter({
  profileName,
  todayLabel,
  summary,
  crmSnapshot,
  bottleneckItems,
  executiveBrief,
  productionColumns,
  artisanCards,
  agendaItems,
}: OwnerCommandCenterProps) {
  return (
      <div className="min-h-screen bg-surface-01 text-text-primary flex atelier-bg">
      <LeftSidebar />


      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopBar profileName={profileName} />

        <main className="flex-1 px-6 md:px-10 py-10 max-w-[1440px] w-full mx-auto">
          <section className="mb-10">
            <p className="text-label text-secondary uppercase tracking-widest mb-3">
              {todayLabel}
            </p>
            <div className="mt-8">
              <h1 className="font-serif text-heading-md text-text-primary leading-[1.2] font-normal">
                Selamat Pagi,
              </h1>
              <p className="text-body-md text-secondary mt-3 leading-relaxed max-w-[52ch]">
                Apa yang perlu Anda perhatikan hari ini?
              </p>
            </div>

          </section>

          <section className="mb-10">
            <SummaryCards {...summary} />
          </section>

          <section className="mb-10">
            <CrmSnapshot {...crmSnapshot} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <section className="lg:col-span-7 space-y-10">
              <BottleneckPanel items={bottleneckItems} />

              <ExecutiveBriefing title={executiveBrief.recommendationTitle} body={executiveBrief.recommendationBody} />

              <ProductionLiveKanban columns={productionColumns} />

              <ArtisanPerformanceGrid artisans={artisanCards} />
            </section>

            <aside className="lg:col-span-5">
              <div className="sticky top-[84px] space-y-6">
                <ClockCalendar />
                <AgendaPanel items={agendaItems} />
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}



