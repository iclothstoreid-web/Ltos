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
//
// AP-06: this is the dominant visual of MeasurementPanel, which sits right
// at the top of the Measurement workspace's main content — the LCP element
// on this route. `priority` skips lazy-loading; blurDataURL is a real
// 16x16 downsample of mannequin.webp (generated once via sharp, not a
// generic placeholder) so the blur-up actually resembles the final image.
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
        priority
        placeholder="blur"
        blurDataURL="data:image/webp;base64,UklGRsYAAABXRUJQVlA4WAoAAAAQAAAADwAADwAAQUxQSGgAAAAJcGLbttrcMFvU4JLCoOJrO7BWcTU7GgAzg8y6Y4iICUBx9T8Dn+fgxcdZ4Ia1eo8SIyAVmLAFDFwmXgKrhBFPwEFm9s7jYx2YaXO9bswYLC+nOWhls5a5j279uM10tOfweoGXhiOxCFZQOCA4AAAA0AEAnQEqEAAQAAOAWiUAToAbn8pCUAAA/lQAEr247t3jTPjOm7lC5pBZ/ismeU9ikl2PUDC6AAA="
      />
    </div>
  )
}
