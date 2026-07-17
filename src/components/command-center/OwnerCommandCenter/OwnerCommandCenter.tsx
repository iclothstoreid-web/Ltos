import { ReactNode } from 'react'
import { LeftSidebar } from './LeftSidebar'
import { OwnerTopBar } from './OwnerTopBar'
import { SummaryCards } from './SummaryCards'
import { DecisionQueue } from './DecisionQueue'
import { ExecutiveBriefing } from './ExecutiveBriefing'
import { ProductionLiveKanban } from './ProductionLiveKanban'
import { ArtisanPerformanceGrid } from './ArtisanPerformanceGrid'
import { RightTimelinePanel } from './RightTimelinePanel'
import { BottomStatusBar } from './BottomStatusBar'

export type OwnerCommandCenterProps = {
  profileName: string
  todayLabel: string
  summary: {
    ordersWaiting: number
    productionToday: number
    qcRequired: number
    revenueToday: number
  }
  decisionQueue: Array<{
    id: string
    priority: 'critical' | 'high' | 'normal' | 'ready'
    customer: string
    order: string
    reason: string
    suggestedAction: string
    workspaceUrl: string
  }>
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
  rightTimeline: {
    appointments: number
    consultations: number
    fittings: number
    productionReview: number
    delivery: number
  }
}

export function OwnerCommandCenter({
  profileName,
  todayLabel,
  summary,
  decisionQueue,
  executiveBrief,
  productionColumns,
  artisanCards,
  rightTimeline,
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
              <h1 className="font-Display text-heading-md text-text-primary leading-[1.2] font-normal">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <section className="lg:col-span-7 space-y-10">
              <DecisionQueue items={decisionQueue} />

              <ExecutiveBriefing title={executiveBrief.recommendationTitle} body={executiveBrief.recommendationBody} />

              <ProductionLiveKanban columns={productionColumns} />

              <ArtisanPerformanceGrid artisans={artisanCards} />
            </section>

            <aside className="lg:col-span-5">
              <RightTimelinePanel timeline={rightTimeline} />
            </aside>
          </div>
        </main>

        <BottomStatusBar />
      </div>
    </div>
  )
}



