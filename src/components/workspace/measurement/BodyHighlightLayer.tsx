'use client'

import type { BodyPart } from './types'
import { BODY_PART_CENTERS } from './DigitalMannequin'

interface BodyHighlightLayerProps {
  activeParts: BodyPart[]
}

// Renders the soft gold glow behind whichever mannequin part(s) are
// focused — kept separate from DigitalMannequin's geometry so the
// highlight behavior (which parts, how they fade) is independently
// reusable/testable. Some measurement fields (e.g. Sleeve Length) map to
// more than one part glowing together (both arms), hence an array.
export function BodyHighlightLayer({ activeParts }: BodyHighlightLayerProps) {
  return (
    <g>
      {(Object.keys(BODY_PART_CENTERS) as BodyPart[]).map(part => {
        const { cx, cy, rx, ry } = BODY_PART_CENTERS[part]
        const active = activeParts.includes(part)
        return (
          <ellipse
            key={part}
            cx={cx}
            cy={cy}
            rx={rx * 1.4}
            ry={ry * 1.4}
            fill="#775a19"
            opacity={active ? 0.18 : 0}
            style={{ transition: 'opacity 200ms ease' }}
            filter="url(#body-highlight-blur)"
          />
        )
      })}
      <defs>
        <filter id="body-highlight-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
    </g>
  )
}
