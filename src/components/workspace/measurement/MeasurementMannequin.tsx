'use client'

import Image from 'next/image'

interface MeasurementMannequinProps {
  className?: string
}

// Premium mannequin, purely visual — no overlay/highlight/hotspot logic yet
// (that lands in a later sprint on top of this foundation). Square source
// (1024x1024, see bodyMap.ts) rendered via `fill` + object-contain inside
// this positioned/sized parent — same letterboxing math bodyMap.ts already
// depends on, just served as next/image instead of a raw <img>.
export function MeasurementMannequin({ className = '' }: MeasurementMannequinProps) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <Image
        src="/mannequin/mannequin.webp"
        alt="Manekin pengukuran"
        fill
        sizes="(min-width: 1024px) 450px, 100vw"
        className="object-contain"
        draggable={false}
      />
    </div>
  )
}
