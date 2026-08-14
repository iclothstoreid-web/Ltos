import type { CroDashboardData } from '@/lib/analytics/dashboardData'

interface CroDashboardProps {
  data: CroDashboardData
}

function UnavailablePanel({ title, reason }: { title: string; reason?: string }) {
  return (
    <div className="border-[0.5px] border-[#c4c7c7] bg-white p-4">
      <p className="text-xs uppercase tracking-widest text-[#444748]">{title}</p>
      <p className="mt-2 text-sm text-[#755b00]">{reason ?? 'Data belum tersedia'}</p>
    </div>
  )
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  running: 'Running',
  paused: 'Paused',
  completed: 'Completed',
}

// Sprint W9-1 §12 — CRO Dashboard. Funnel/drop-off/CTA leaderboard/fabric
// ranking are all GA4-event-derived and honestly show a "not connected"
// panel until the GA4 Data API is wired up (see dashboardData.ts).
// Experiment status is real, local data from the experiment registry.
export function CroDashboard({ data }: CroDashboardProps) {
  return (
    <section aria-labelledby="cro-dashboard-heading" className="mt-10">
      <h2 id="cro-dashboard-heading" className="font-fraunces text-xl text-[#151c27]">
        CRO
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UnavailablePanel title="Funnel" reason={data.funnel.unavailableReason} />
        <UnavailablePanel title="Drop-off" reason={data.dropOff.unavailableReason} />
        <UnavailablePanel title="CTA Leaderboard" reason={data.ctaLeaderboard.unavailableReason} />
        <UnavailablePanel title="Fabric Ranking" reason={data.fabricRanking.unavailableReason} />
      </div>

      <div className="mt-4 border-[0.5px] border-[#c4c7c7] bg-white p-4">
        <p className="text-xs uppercase tracking-widest text-[#444748]">Experiment Status</p>
        <ul className="mt-3 divide-y divide-[#c4c7c7]">
          {data.experimentStatus.map((experiment) => (
            <li key={experiment.experimentId} className="flex items-center justify-between py-2 text-sm">
              <span className="text-[#151c27]">{experiment.name}</span>
              <span className="flex items-center gap-3 text-[#444748]">
                <span>{experiment.variantCount} variants</span>
                <span className="rounded-full border border-[#c4c7c7] px-2 py-0.5 text-[11px] uppercase tracking-wide">
                  {STATUS_LABEL[experiment.status] ?? experiment.status}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
