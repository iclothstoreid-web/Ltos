import type { BodyProfileType } from '@/lib/body-estimator/types'

interface SilhouetteScales {
  heightScale: number
  shoulderScale: number
  waistScale: number
  hipScale: number
}

interface InteractiveBodySilhouetteProps extends SilhouetteScales {
  bodyProfile: BodyProfileType
  className?: string
}

// Sprint W0.3 §"Mapping dari W0.2 Engine" — temporary bodyProfile -> scale
// mapping. Callers (ResultHeroLayout) look this up and pass the resulting
// numbers down as explicit props; this component never derives scale from
// bodyProfile itself, only uses it to label the illustration.
export const BODY_PROFILE_SILHOUETTE_SCALES: Record<BodyProfileType, SilhouetteScales> = {
  slim: { shoulderScale: 0.95, waistScale: 0.9, hipScale: 0.95, heightScale: 1.0 },
  athletic: { shoulderScale: 1.08, waistScale: 0.95, hipScale: 0.98, heightScale: 1.0 },
  straight: { shoulderScale: 1.0, waistScale: 1.0, hipScale: 1.0, heightScale: 1.0 },
  'broad-shoulder': { shoulderScale: 1.15, waistScale: 1.0, hipScale: 1.0, heightScale: 1.0 },
  'full-body': { shoulderScale: 1.05, waistScale: 1.15, hipScale: 1.1, heightScale: 1.0 },
  'tall-lean': { shoulderScale: 0.98, waistScale: 0.92, hipScale: 0.95, heightScale: 1.08 },
}

// Sprint W0.3A — asset replacement only. The mannequin geometry below
// (viewBox, every <g>/<rect>/<ellipse>/<circle> shape and its coordinates:
// legs, hip, waist, chest, sleeves, arms, shoulders, neck, head) is reused
// from LTOS's own Measurement Workspace mannequin —
// src/components/workspace/measurement/DigitalMannequin.tsx — not
// re-authored, not AI-generated, not an abstract placeholder. It's copied
// rather than imported: DigitalMannequin is 'use client', scoped to the
// internal fitter workspace, takes a completely different prop shape (raw
// cm values + an `activeParts: BodyPart[]` hover state) and ships a
// light-theme fill palette — importing it directly would couple this
// public marketing page to internal workspace internals for no benefit.
// Same shapes, same viewBox, same anchor coordinates; only the fill/stroke
// (restyled navy/gold) and the scale source (this component's own
// heightScale/shoulderScale/waistScale/hipScale props, already ratios —
// no BASELINE/scaleFor conversion needed) differ. `chest` has no scale
// prop in the W0.3 API and stays neutral, same as W0.3's own mapping table
// never defined one. `heightScale` doesn't exist in the source at all
// (Measurement Workspace never visualizes height) — applied here as an
// outer scaleY wrapping the reused per-part geometry.
export function InteractiveBodySilhouette({
  bodyProfile,
  heightScale,
  shoulderScale,
  waistScale,
  hipScale,
  className = '',
}: InteractiveBodySilhouetteProps) {
  return (
    <div
      className={`relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-luxury-gold/[0.14] lg:min-h-[560px] ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-luxury-drift bg-[radial-gradient(120%_120%_at_20%_10%,_#2A211B_0%,_#1B1714_45%,_#151210_100%)]"
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 200 400"
        className="relative h-[78%] w-auto motion-safe:animate-silhouette-idle"
        fill="none"
      >
        <defs>
          <linearGradient id="w03a-mannequin-gradient" x1="0" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C8A24A" stopOpacity="0.9" />
            <stop offset="1" stopColor="#C8A24A" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        <g style={{ transform: `scaleY(${heightScale})`, transformOrigin: 'center', transformBox: 'fill-box' }}>
          {/* Legs */}
          <rect x="76" y="238" width="20" height="150" rx="9" fill="#C8A24A" fillOpacity="0.05" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.25" opacity="0.55" />
          <rect x="104" y="238" width="20" height="150" rx="9" fill="#C8A24A" fillOpacity="0.05" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.25" opacity="0.55" />

          {/* Hip */}
          <g
            className="transition-transform duration-500 ease-out"
            style={{ transform: `scale(${hipScale}, 1)`, transformOrigin: '100px 214px' }}
          >
            <ellipse cx="100" cy="214" rx="36" ry="26" fill="#C8A24A" fillOpacity="0.06" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.5" opacity="0.65" />
          </g>

          {/* Waist */}
          <g
            className="transition-transform duration-500 ease-out"
            style={{ transform: `scale(${waistScale}, 1)`, transformOrigin: '100px 172px' }}
          >
            <ellipse cx="100" cy="172" rx="32" ry="24" fill="#C8A24A" fillOpacity="0.06" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.5" opacity="0.65" />
          </g>

          {/* Chest — no scale prop in the W0.3 API, stays neutral */}
          <ellipse cx="100" cy="118" rx="40" ry="34" fill="#C8A24A" fillOpacity="0.05" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.25" opacity="0.55" />

          {/* Sleeves (forearms) */}
          <rect x="36" y="160" width="16" height="76" rx="8" fill="#C8A24A" fillOpacity="0.05" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.25" opacity="0.5" />
          <rect x="148" y="160" width="16" height="76" rx="8" fill="#C8A24A" fillOpacity="0.05" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.25" opacity="0.5" />

          {/* Arms (upper) */}
          <rect x="38" y="82" width="16" height="80" rx="8" fill="#C8A24A" fillOpacity="0.05" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.25" opacity="0.5" />
          <rect x="146" y="82" width="16" height="80" rx="8" fill="#C8A24A" fillOpacity="0.05" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.25" opacity="0.5" />

          {/* Shoulders */}
          <g
            className="transition-transform duration-500 ease-out"
            style={{ transform: `scale(${shoulderScale}, 1)`, transformOrigin: '100px 80px' }}
          >
            <rect x="54" y="72" width="92" height="16" rx="8" fill="#C8A24A" fillOpacity="0.08" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.5" opacity="0.7" />
          </g>

          {/* Neck */}
          <rect x="90" y="58" width="20" height="16" rx="3" fill="#C8A24A" fillOpacity="0.05" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.25" opacity="0.55" />

          {/* Head */}
          <circle cx="100" cy="36" r="22" fill="#C8A24A" fillOpacity="0.05" stroke="url(#w03a-mannequin-gradient)" strokeWidth="1.5" opacity="0.7" />
        </g>
      </svg>

      <div className="absolute left-6 top-6">
        <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Body Profile</p>
        <p className="mt-1 font-fraunces text-lg capitalize text-luxury-ivory">{bodyProfile}</p>
      </div>
    </div>
  )
}
