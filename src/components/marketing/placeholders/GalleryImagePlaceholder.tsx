'use client'

import { LuxuryGradientField } from './LuxuryGradientField'
import { LinenTexture } from './LinenTexture'
import { GarmentSilhouette } from './GarmentSilhouette'

// Masonry-friendly — height varies by `tall` so the gallery reads as
// editorial masonry rather than a rigid grid, without needing real image
// dimensions yet.
export function GalleryImagePlaceholder({ alt, tall = false, variant = 'a' }: { alt: string; tall?: boolean; variant?: 'a' | 'b' | 'c' }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`group relative w-full overflow-hidden rounded-sm ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}
    >
      <LuxuryGradientField variant={variant} />
      <LinenTexture opacity={0.14} />
      <GarmentSilhouette className="h-[55%] w-auto opacity-40 transition-transform duration-500 group-hover:scale-105" />
    </div>
  )
}
