import { LuxuryGradientField } from './LuxuryGradientField'
import { LinenTexture } from './LinenTexture'

// Aspect ratio locked 1:1 — craftsmanship timeline step art.
export function WorkshopPhotoPlaceholder({
  alt,
  variant = 'a',
  idSuffix,
}: {
  alt: string
  variant?: 'a' | 'b' | 'c'
  idSuffix: string | number
}) {
  return (
    <div role="img" aria-label={alt} className="relative aspect-square w-full overflow-hidden rounded-full">
      <LuxuryGradientField variant={variant} />
      <LinenTexture opacity={0.16} idSuffix={idSuffix} />
      <div className="absolute inset-0 ring-1 ring-inset ring-luxury-gold/25" />
    </div>
  )
}
