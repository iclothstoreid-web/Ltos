import { JOURNEY_MILESTONES, type JourneyMilestone } from '@/lib/journey/milestone'

interface JourneyTimelineProps {
  currentMilestone: JourneyMilestone
  isComplete?: boolean
}

// Always exactly 5 steps, always in this order — reused unchanged by every
// milestone page. `currentMilestone` is the only thing that normally changes
// between renders; the customer has no control over it (no Next/Continue
// button anywhere in this component). `isComplete` is the one exception —
// Milestone 5's Delivered sub-state passes it so the last dot renders as
// done (solid, no pulse) instead of current, matching the "Journey Complete"
// recap shown further down the page. Shipping (the default) is unaffected.
export function JourneyTimeline({ currentMilestone, isComplete = false }: JourneyTimelineProps) {
  return (
    <nav aria-label="Customer Journey Timeline" className="px-4 py-6 overflow-x-auto">
      <ol className="flex items-start justify-between gap-2 min-w-[560px] sm:min-w-0 max-w-2xl mx-auto">
        {JOURNEY_MILESTONES.map(milestone => {
          const isPast = milestone.id < currentMilestone || (isComplete && milestone.id === currentMilestone)
          const isCurrent = milestone.id === currentMilestone && !isComplete

          return (
            <li key={milestone.id} className="flex-1 flex flex-col items-center text-center gap-2">
              <div className="flex items-center w-full">
                <div
                  className={`flex-1 h-px ${
                    milestone.id === 1 ? 'invisible' : isPast || isCurrent ? 'bg-primary' : 'bg-[#151c27]/10'
                  }`}
                />
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isPast
                      ? 'bg-primary'
                      : isCurrent
                        ? 'bg-primary animate-pulse-dot'
                        : 'bg-[#151c27]/15'
                  }`}
                />
                <div
                  className={`flex-1 h-px ${
                    milestone.id === 5 ? 'invisible' : isPast ? 'bg-primary' : 'bg-[#151c27]/10'
                  }`}
                />
              </div>
              <span
                className={`font-sans text-[10px] uppercase tracking-widest leading-tight ${
                  isCurrent ? 'text-on-surface font-semibold' : isPast ? 'text-secondary' : 'text-secondary/40'
                }`}
              >
                {milestone.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
