'use client'

import type { BodyPartId } from '@/lib/measurement/bodyMap'
import { MeasurementMannequin } from './MeasurementMannequin'
import { MeasurementHighlightOverlay } from './MeasurementHighlightOverlay'

interface MeasurementPanelProps {
  className?: string
  activeParts?: BodyPartId[]
  activeLabel?: { title: string; value: string } | null
}

// Responsive container for MeasurementMannequin. Sizing/positioning only —
// the highlight overlay hangs inside this same panel without touching the
// mannequin image itself; future sprints (body morph, AI render) can add
// further layers here the same way.
export function MeasurementPanel({ className = '', activeParts = [], activeLabel = null }: MeasurementPanelProps) {
  return (
    <div className={`relative w-full aspect-[3/4] max-h-[600px] mx-auto ${className}`}>
      <MeasurementMannequin />
      <MeasurementHighlightOverlay activeParts={activeParts} activeLabel={activeLabel} />
    </div>
  )
}
