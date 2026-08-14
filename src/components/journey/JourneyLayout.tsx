import type { ReactNode } from 'react'
import { JourneyHero } from './JourneyHero'
import { JourneyTimeline } from './JourneyTimeline'
import type { JourneyMilestone } from '@/lib/journey/milestone'

interface JourneyLayoutProps {
  currentMilestone: JourneyMilestone
  isTimelineComplete?: boolean
  children: ReactNode
}

// Signature background — Brand System Upgrade: real walnut wood-grain
// texture (was a barely-there tailoring grid line pattern). Deliberately
// subtle so it never competes with content, and identical across every
// milestone so it reads as the Customer Journey's visual identity, not a
// per-page decoration.
const backgroundStyle = {
  backgroundColor: '#FDFCF8',
  backgroundImage: "url('/textures/walnut-grain.png')",
  backgroundRepeat: 'repeat' as const,
  backgroundSize: '512px 512px',
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
