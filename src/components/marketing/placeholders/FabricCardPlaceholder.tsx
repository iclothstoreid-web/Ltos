import { LuxuryGradientField } from './LuxuryGradientField'
import { LinenTexture } from './LinenTexture'

// Aspect ratio locked 4:5 — matches the final cinematic fabric card crop, so
// swapping in real photography later never reflows the grid.
// P1 — no hooks/state (the hover sweep is pure CSS `group-hover:`), so this
// is a Server Component.
export function FabricCardPlaceholder({
  alt,
  variant = 'a',
  idSuffix,
}: {
  alt: string
  variant?: 'a' | 'b' | 'c'
  idSuffix: string | number
}) {
  return (
    <div role="img" aria-label={alt} className="group relative aspect-[4/5] w-full overflow-hidden rounded-sm">
      <LuxuryGradientField variant={variant} />
      <LinenTexture opacity={0.22} idSuffix={idSuffix} />
      <div
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-luxury-gold/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:animate-light-sweep group-hover:opacity-100"
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-luxury-gold/10 transition group-hover:ring-luxury-gold/40" />
    </div>
  )
}
