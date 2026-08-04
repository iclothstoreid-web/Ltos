import { JourneyPhoto } from './JourneyPhoto'
import { SectionShell } from './SectionShell'
import { SectionEyebrow } from './SectionEyebrow'
import { storyFor, updateDateFor, type ProductionUpdate } from '@/lib/journey/production-update'

const STAGE_LABEL: Record<ProductionUpdate['stage'], string> = {
  cutting: 'Pemotongan Kain',
  sewing: 'Penjahitan',
}

interface TodaysJourneySectionProps {
  updates: ProductionUpdate[]
}

// "Perjalanan Hari Ini" — real evidence photo + real date per stage reached,
// told as a story rather than a production report (brief explicitly forbids
// progress bars/percentages/technical status here).
//
// Sprint UX-03.1 (Photo Display Consistency) — portrait aspect-[3/4] instead
// of aspect-[4/3] (landscape was cropping the evidence photo's vertical
// extent), plus tap-to-fullscreen. Same evidence_url source, no new data.
export function TodaysJourneySection({ updates }: TodaysJourneySectionProps) {
  if (updates.length === 0) return null

  return (
    <SectionShell>
      <SectionEyebrow>Perjalanan Hari Ini</SectionEyebrow>
      <div className="space-y-10">
        {updates.map(update => {
          const date = updateDateFor(update)
          return (
            <div key={update.stage}>
              <JourneyPhoto
                src={update.evidence_url}
                alt={STAGE_LABEL[update.stage]}
                className="w-full aspect-[3/4] mb-4"
                expandable
              />
              {date && (
                <p className="font-sans text-[10px] uppercase tracking-widest text-secondary mb-2 text-center">
                  {date}
                </p>
              )}
              <p className="font-fraunces text-lg text-on-surface text-center leading-relaxed">
                {storyFor(update)}
              </p>
            </div>
          )
        })}
      </div>
    </SectionShell>
  )
}
