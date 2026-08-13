import { LuxuryGradientField } from './LuxuryGradientField'
import { LinenTexture } from './LinenTexture'
import { GarmentSilhouette } from './GarmentSilhouette'

// Renders instead of <HeroClothSculpture> (the R3F canvas) whenever 3D is
// disabled — reduced motion, low-end device, or no WebGL2. Same visual
// language, just static. See Hero.tsx for the swap logic.
export function HeroImagePlaceholder({ alt }: { alt: string }) {
  return (
    <div role="img" aria-label={alt} className="absolute inset-0 overflow-hidden">
      <LuxuryGradientField variant="a" />
      <LinenTexture opacity={0.12} idSuffix="hero" />
      <GarmentSilhouette className="h-[70%] w-auto opacity-70" idSuffix="hero" />
      <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent" />
    </div>
  )
}
