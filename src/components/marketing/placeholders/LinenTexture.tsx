// Subtle woven-linen texture laid over LuxuryGradientField via SVG feTurbulence
// — cheap (no image bytes), reads as fabric grain rather than flat color.
// Sprint W5-10 — idSuffix is now required, same reasoning as
// GarmentSilhouette's own idSuffix prop: the <filter id> was previously a
// hardcoded literal ("linen-weave"), so every one of this component's many
// call sites collided into the same duplicate id once rendered together on
// one page (found via a homepage-wide duplicate-id audit: 12 instances,
// one id). No caller was visually affected — browsers just resolved every
// url(#linen-weave) to whichever filter happened to be first in the DOM —
// but duplicate ids are invalid HTML, so every caller now supplies a
// unique suffix.
export function LinenTexture({ opacity = 0.18, idSuffix }: { opacity?: number; idSuffix: string | number }) {
  const filterId = `linen-weave-${idSuffix}`
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ opacity }}>
      <filter id={filterId}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.79  0 0 0 0 0.71  0 0 0 0 0.56  0 0 0 0.5 0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  )
}
