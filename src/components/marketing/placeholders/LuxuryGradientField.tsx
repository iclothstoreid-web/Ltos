// Shared abstraction primitive used by every image-slot placeholder in the
// homepage (Hero, Fabric, Workshop, Gallery, Testimonial) so they all read
// as one visual language instead of five one-off gradients. Swapping a
// placeholder for a real photo later only touches the placeholder
// component that wraps this, never the sections that render it.
export function LuxuryGradientField({ variant = 'a', className = '' }: { variant?: 'a' | 'b' | 'c'; className?: string }) {
  const gradients: Record<string, string> = {
    a: 'radial-gradient(120% 120% at 15% 10%, #2A2521 0%, #1C1A18 45%, #0A0908 100%)',
    b: 'radial-gradient(110% 140% at 85% 90%, #362B1C 0%, #1C1A18 50%, #0A0908 100%)',
    c: 'linear-gradient(160deg, #1C1A18 0%, #0A0908 60%, #14110D 100%)',
  }

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 animate-luxury-drift ${className}`}
      style={{ backgroundImage: gradients[variant] }}
    />
  )
}
