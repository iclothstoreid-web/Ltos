// Shared abstraction primitive used by every image-slot placeholder in the
// homepage (Hero, Fabric, Workshop, Gallery, Testimonial) so they all read
// as one visual language instead of five one-off gradients. Swapping a
// placeholder for a real photo later only touches the placeholder
// component that wraps this, never the sections that render it.
export function LuxuryGradientField({ variant = 'a', className = '' }: { variant?: 'a' | 'b' | 'c'; className?: string }) {
  // W1 ART DIRECTION LOCK — recolored to the Midnight Navy + Deep Espresso +
  // Brass system: warm walnut-leather highlight (a), a brass-tinted glow
  // corner (b), and (c) the same espresso -> warm-dark hand-off used at the
  // bottom of the Hero, so FinalCta's full-bleed close reads continuous
  // with it rather than as a new background.
  const gradients: Record<string, string> = {
    a: 'radial-gradient(120% 120% at 15% 10%, #2A211B 0%, #1B1714 45%, #151210 100%)',
    b: 'radial-gradient(110% 140% at 85% 90%, #3A2C18 0%, #1B1714 50%, #151210 100%)',
    c: 'linear-gradient(160deg, #1B1714 0%, #151210 60%, #11110F 100%)',
  }

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 animate-luxury-drift ${className}`}
      style={{ backgroundImage: gradients[variant] }}
    />
  )
}
