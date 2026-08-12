// Abstract thobe silhouette rendered as a soft-stroked SVG path — used inside
// placeholders so an empty photo slot still reads as "garment," not just
// "empty gradient box." P1 — gradient id now comes from the caller
// (idSuffix) instead of useId(), since multiple placeholders render on the
// same page (Gallery) and a hardcoded id would collide across instances;
// this keeps the component hook-free so it (and everything that only
// wraps it, e.g. GalleryImagePlaceholder) can be a Server Component.
export function GarmentSilhouette({
  className = '',
  color = '#C8A24A',
  idSuffix,
}: {
  className?: string
  color?: string
  idSuffix: string | number
}) {
  const gradientId = `garment-stroke-${idSuffix}`

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 320"
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      fill="none"
    >
      <path
        d="M100 10c-14 0-26 10-30 24l-6 22-34 18c-6 3-9 10-7 17l10 32c2 7 9 11 16 9l16-5-6 170c-1 8 5 15 13 15h76c8 0 14-7 13-15l-6-170 16 5c7 2 14-2 16-9l10-32c2-7-1-14-7-17l-34-18-6-22c-4-14-16-24-30-24z"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        opacity="0.55"
      />
      <path d="M100 34v270" stroke={`url(#${gradientId})`} strokeWidth="1" opacity="0.3" />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor={color} stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  )
}
