import { LuxuryGradientField } from './LuxuryGradientField'

// Circular avatar-shaped placeholder for customer story cards.
export function TestimonialPhotoPlaceholder({ alt, variant = 'a' }: { alt: string; variant?: 'a' | 'b' | 'c' }) {
  return (
    <div role="img" aria-label={alt} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
      <LuxuryGradientField variant={variant} />
      <div className="absolute inset-0 ring-1 ring-inset ring-luxury-gold/30" />
    </div>
  )
}
