// Sprint W5-3 — Pattern Formulation. No real pattern-drafting photography
// exists in assets.ts (only fabric/garment/mannequin shots), so this is an
// illustrated editorial motif in the same family as GarmentSilhouette: pure
// stroked SVG, no image bytes, no new dependency. Reads as pattern paper +
// ruler + a drafted pattern piece with its grainline + a few chalk marks —
// the elements the brief calls out — composed as line art rather than a
// literal photo-realistic drawing, consistent with this system's minimal
// gold-stroke-on-dark placeholder vocabulary. Hook-free (idSuffix supplied
// by the caller, same reasoning as GarmentSilhouette) so it stays a Server
// Component.
export function PatternDraftMotif({
  className = '',
  color = '#C8A24A',
  idSuffix,
}: {
  className?: string
  color?: string
  idSuffix: string | number
}) {
  const gradientId = `pattern-draft-${idSuffix}`

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 375"
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="375" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor={color} stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Pattern paper — a large sheet, slightly rotated as if laid on a table. */}
      <rect x="38" y="55" width="210" height="260" rx="2" transform="rotate(-5 143 185)" stroke={`url(#${gradientId})`} strokeWidth="1" opacity="0.35" />

      {/* Ruler — diagonal strip with evenly spaced tick marks. */}
      <g opacity="0.5">
        <rect x="150" y="30" width="18" height="230" rx="1" transform="rotate(12 159 145)" stroke={`url(#${gradientId})`} strokeWidth="1" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={i}
            x1="152"
            y1={44 + i * 26}
            x2="164"
            y2={44 + i * 26}
            transform="rotate(12 159 145)"
            stroke={`url(#${gradientId})`}
            strokeWidth="1"
          />
        ))}
      </g>

      {/* Drafted pattern piece — simplified front-panel outline, dashed as a
          cut paper edge, with a grainline arrow through the centre (the
          standard pattern-making symbol for fabric grain direction). */}
      <path
        d="M96 120c4-16 16-27 32-27s28 11 32 27l6 20 26 12c5 2 7 8 5 13l-9 24c-2 5-8 8-13 6l-12-4-4 120H104l-4-120-12 4c-5 2-11-1-13-6l-9-24c-2-5 0-11 5-13l26-12z"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.25"
        strokeDasharray="5 4"
        opacity="0.7"
      />
      <line x1="128" y1="150" x2="128" y2="300" stroke={`url(#${gradientId})`} strokeWidth="1" opacity="0.55" />
      <path d="M128 150l-4 7h8z" fill={color} opacity="0.55" />
      <path d="M128 300l-4-7h8z" fill={color} opacity="0.55" />

      {/* Chalk marks — a few short freehand ticks and dots near the seam. */}
      <g opacity="0.6">
        <circle cx="103" cy="167" r="1.6" fill={color} />
        <circle cx="152" cy="176" r="1.6" fill={color} />
        <circle cx="118" cy="266" r="1.6" fill={color} />
        <path d="M95 200l7 3" stroke={color} strokeWidth="1" />
        <path d="M160 214l7 3" stroke={color} strokeWidth="1" />
      </g>
    </svg>
  )
}
