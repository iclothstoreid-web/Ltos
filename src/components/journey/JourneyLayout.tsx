import type { ReactNode } from 'react'
import { JourneyHero } from './JourneyHero'
import { JourneyTimeline } from './JourneyTimeline'
import type { JourneyMilestone } from '@/lib/journey/milestone'

interface JourneyLayoutProps {
  currentMilestone: JourneyMilestone
  isTimelineComplete?: boolean
  children: ReactNode
}

// Signature background — a barely-there tailoring grid (32px spacing, ~3.5%
// opacity of the brand primary). Deliberately subtle so it never competes
// with content, and identical across every milestone so it reads as the
// Customer Journey's visual identity, not a per-page decoration.
const backgroundStyle = {
  backgroundColor: '#FDFCF8',
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(0,86,69,0.035) 0px, rgba(0,86,69,0.035) 1px, transparent 1px, transparent 32px), ' +
    'repeating-linear-gradient(90deg, rgba(0,86,69,0.035) 0px, rgba(0,86,69,0.035) 1px, transparent 1px, transparent 32px)',
}

// Reusable shell for every Customer Journey milestone page — Hero and
// Timeline stay identical across all 5 milestones; only `children` (each
// milestone's own content) changes from one milestone build to the next.
export function JourneyLayout({ currentMilestone, isTimelineComplete = false, children }: JourneyLayoutProps) {
  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <JourneyHero />
      <JourneyTimeline currentMilestone={currentMilestone} isComplete={isTimelineComplete} />
      <main>{children}</main>
    </div>
  )
}
