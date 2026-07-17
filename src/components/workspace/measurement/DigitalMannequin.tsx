'use client'

import type { BodyPart } from './types'
import { BodyHighlightLayer } from './BodyHighlightLayer'

interface DigitalMannequinProps {
  activeParts: BodyPart[]
  shoulder?: string
  chest?: string
  waist?: string
  hip?: string
  sleeve?: string
}

// Baselines are rough adult-average cm values used only to derive a
// proportional scale factor for the SVG transforms below — not a clinical
// reference.
const BASELINE = { shoulder: 46, chest: 100, waist: 84, hip: 100, sleeve: 62 }

function scaleFor(value: string | undefined, baseline: number, min: number, max: number) {
  const n = parseFloat(value || '')
  if (!n || Number.isNaN(n)) return 1
  return Math.min(max, Math.max(min, n / baseline))
}

// Center coordinates shared with BodyHighlightLayer so the glow lines up
// with the geometry below.
export const BODY_PART_CENTERS: Record<BodyPart, { cx: number; cy: number; rx: number; ry: number }> = {
  head: { cx: 100, cy: 36, rx: 24, ry: 24 },
  neck: { cx: 100, cy: 62, rx: 14, ry: 12 },
  shoulders: { cx: 100, cy: 80, rx: 46, ry: 14 },
  chest: { cx: 100, cy: 118, rx: 40, ry: 34 },
  waist: { cx: 100, cy: 172, rx: 32, ry: 24 },
  hip: { cx: 100, cy: 214, rx: 36, ry: 26 },
  leftArm: { cx: 46, cy: 120, rx: 16, ry: 42 },
  rightArm: { cx: 154, cy: 120, rx: 16, ry: 42 },
  leftSleeve: { cx: 44, cy: 196, rx: 15, ry: 38 },
  rightSleeve: { cx: 156, cy: 196, rx: 15, ry: 38 },
  legs: { cx: 100, cy: 320, rx: 36, ry: 84 },
}

// A stylized front-view mannequin built from individually addressable SVG
// groups (one per body part) rather than a single flat path — per-part
// scale transforms respond to measurement values, and BodyHighlightLayer
// renders the focus glow behind whichever part is active.
export function DigitalMannequin({
  activeParts,
  shoulder,
  chest,
  waist,
  hip,
  sleeve,
}: DigitalMannequinProps) {
  const shoulderScale = scaleFor(shoulder, BASELINE.shoulder, 0.85, 1.25)
  const chestScale = scaleFor(chest, BASELINE.chest, 0.85, 1.25)
  const waistScale = scaleFor(waist, BASELINE.waist, 0.8, 1.3)
  const hipScale = scaleFor(hip, BASELINE.hip, 0.85, 1.25)
  const sleeveScale = scaleFor(sleeve, BASELINE.sleeve, 0.8, 1.3)

  const transition = 'transform 200ms ease, filter 200ms ease'

  return (
    <div className="relative w-full aspect-[3/4] max-h-[600px] flex justify-center items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f0f3ff]/30 to-transparent rounded-full blur-3xl -z-10 w-2/3 mx-auto" />

      <svg viewBox="0 0 200 400" className="h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <BodyHighlightLayer activeParts={activeParts} />

        {/* Legs */}
        <g data-part="legs" style={{ transition }}>
          <rect x="76" y="238" width="20" height="150" rx="9" fill="#e2e8f8" stroke="#c4c7c7" />
          <rect x="104" y="238" width="20" height="150" rx="9" fill="#e2e8f8" stroke="#c4c7c7" />
        </g>

        {/* Hip */}
        <g
          data-part="hip"
          style={{ transform: `scale(${hipScale}, 1)`, transformOrigin: '100px 214px', transition }}
        >
          <ellipse cx="100" cy="214" rx="36" ry="26" fill="#e2e8f8" stroke="#c4c7c7" />
        </g>

        {/* Waist */}
        <g
          data-part="waist"
          style={{ transform: `scale(${waistScale}, 1)`, transformOrigin: '100px 172px', transition }}
        >
          <ellipse cx="100" cy="172" rx="32" ry="24" fill="#f0f3ff" stroke="#c4c7c7" />
        </g>

        {/* Chest */}
        <g
          data-part="chest"
          style={{ transform: `scale(${chestScale})`, transformOrigin: '100px 118px', transition }}
        >
          <ellipse cx="100" cy="118" rx="40" ry="34" fill="#e2e8f8" stroke="#c4c7c7" />
        </g>

        {/* Left sleeve (forearm) */}
        <g
          data-part="leftSleeve"
          style={{ transform: `scale(1, ${sleeveScale})`, transformOrigin: '44px 160px', transition }}
        >
          <rect x="36" y="160" width="16" height="76" rx="8" fill="#f0f3ff" stroke="#c4c7c7" />
        </g>

        {/* Right sleeve (forearm) */}
        <g
          data-part="rightSleeve"
          style={{ transform: `scale(1, ${sleeveScale})`, transformOrigin: '156px 160px', transition }}
        >
          <rect x="148" y="160" width="16" height="76" rx="8" fill="#f0f3ff" stroke="#c4c7c7" />
        </g>

        {/* Left arm (upper) */}
        <g data-part="leftArm" style={{ transition }}>
          <rect x="38" y="82" width="16" height="80" rx="8" fill="#e2e8f8" stroke="#c4c7c7" />
        </g>

        {/* Right arm (upper) */}
        <g data-part="rightArm" style={{ transition }}>
          <rect x="146" y="82" width="16" height="80" rx="8" fill="#e2e8f8" stroke="#c4c7c7" />
        </g>

        {/* Shoulders */}
        <g
          data-part="shoulders"
          style={{ transform: `scale(${shoulderScale}, 1)`, transformOrigin: '100px 80px', transition }}
        >
          <rect x="54" y="72" width="92" height="16" rx="8" fill="#dce2f3" stroke="#c4c7c7" />
        </g>

        {/* Neck */}
        <g data-part="neck" style={{ transition }}>
          <rect x="90" y="58" width="20" height="16" rx="3" fill="#f0f3ff" stroke="#c4c7c7" />
        </g>

        {/* Head */}
        <g data-part="head" style={{ transition }}>
          <circle cx="100" cy="36" r="22" fill="#f0f3ff" stroke="#c4c7c7" />
        </g>
      </svg>
    </div>
  )
}
