// Subtle woven-linen texture laid over LuxuryGradientField via SVG feTurbulence
// — cheap (no image bytes), reads as fabric grain rather than flat color.
export function LinenTexture({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ opacity }}>
      <filter id="linen-weave">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.79  0 0 0 0 0.71  0 0 0 0 0.56  0 0 0 0.5 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#linen-weave)" />
    </svg>
  )
}
