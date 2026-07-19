'use client'

import type { BodyPartId } from '@/lib/measurement/bodyMap'
import { BODY_MAP } from '@/lib/measurement/bodyMap'

interface ActiveLabel {
  title: string
  value: string
}

interface MeasurementHighlightOverlayProps {
  activeParts: BodyPartId[]
  activeLabel: ActiveLabel | null
}

// Sits absolutely over MeasurementMannequin inside MeasurementPanel's
// aspect-ratio box. Every position comes from bodyMap.ts (percentages of
// that box), so this never hardcodes a coordinate — it only reads them.
// Glow dots stay mounted at all times and merely toggle opacity/scale, so
// "highlight follows focus" falls out of independent per-part transitions
// rather than animating any single element's position.
// A field like 'sleeve' activates 4 node pairs (shoulder/arm/elbow/wrist)
// so the whole arm reads as one continuous span, not 4 separate dots that
// can look, at a glance, like just another single-point highlight (e.g.
// indistinguishable from 'biceps' since both include the same arm node).
// Builds an ordered left- and right-side polyline through activeParts,
// carrying along any side-less/central node (e.g. 'hip') as a shared
// vertex — only rendered when a side actually has 3+ points, so
// circumference fields (which activate at most a central + one lateral
// pair) never sprout a line, only genuine multi-point length fields do.
function buildChain(ids: BodyPartId[], side: 'left' | 'right') {
  return ids
    .filter(id => id.startsWith(side) || !(id.startsWith('left') || id.startsWith('right')))
    .map(id => BODY_MAP[id].coords)
}

export function MeasurementHighlightOverlay({ activeParts, activeLabel }: MeasurementHighlightOverlayProps) {
  const activeSet = new Set(activeParts)
  const anchor = activeParts[0] ? BODY_MAP[activeParts[0]] : null
  const chains = [buildChain(activeParts, 'left'), buildChain(activeParts, 'right')].filter(
    chain => chain.length >= 3
  )

  return (
    <div className="absolute inset-0 pointer-events-none">
      {chains.length > 0 && (
        <svg
          className="absolute inset-0 w-full h-full animate-fade-in"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {chains.map((chain, i) => (
            <polyline
              key={i}
              points={chain.map(c => `${c.xPct},${c.yPct}`).join(' ')}
              fill="none"
              stroke="rgba(119,90,25,0.45)"
              strokeWidth={0.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      )}

      {(Object.keys(BODY_MAP) as BodyPartId[]).map(id => {
        const { coords } = BODY_MAP[id]
        const active = activeSet.has(id)
        return (
          <div
            key={id}
            className={`absolute rounded-full ${active ? 'animate-highlight-breathe' : ''}`}
            style={{
              left: `${coords.xPct}%`,
              top: `${coords.yPct}%`,
              width: `${coords.rPct * 2}%`,
              height: `${coords.rPct * 2}%`,
              transform: `translate(-50%, -50%) scale(${active ? 1 : 0.9})`,
              opacity: active ? 0.7 : 0,
              background:
                'radial-gradient(circle, rgba(119,90,25,0.55) 0%, rgba(119,90,25,0.22) 45%, rgba(119,90,25,0) 72%)',
              filter: 'blur(2px)',
              // On activation, animate-highlight-breathe (an infinite
              // @keyframes loop in tailwind.config.ts, NOT the same as Owner
              // Workspace's animate-pulse-dot alert blink) cycles scale
              // 1->1.04->1 with opacity 0.55->0.85->0.55 over 2.75s
              // ease-in-out — a slow, continuous breathing glow rather than
              // a blink. CSS Animations take priority over Transitions on
              // the same property while playing, so this plain transition
              // only ever takes effect on deactivation (class removed),
              // fading the dot back down to its resting opacity 0 / scale
              // 0.9 instead of snapping off instantly.
              transition: 'opacity 300ms ease-out, transform 300ms ease-out',
            }}
          />
        )
      })}

      {activeLabel && anchor && (
        <div
          key={anchor.id}
          className="absolute animate-fade-in"
          style={{
            left: `${anchor.coords.xPct}%`,
            top: `${Math.max(0, anchor.coords.yPct - anchor.coords.rPct - 4)}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-white/90 backdrop-blur-sm border-[0.5px] border-[#c4c7c7] shadow-[0_4px_16px_rgba(0,0,0,0.10)] px-3 py-1.5 text-center whitespace-nowrap">
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#775a19]">{activeLabel.title}</p>
            {activeLabel.value && (
              <p className="font-caslon italic text-sm text-[#151c27] leading-tight">{activeLabel.value}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
