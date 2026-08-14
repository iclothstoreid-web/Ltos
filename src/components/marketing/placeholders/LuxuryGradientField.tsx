// Shared abstraction primitive used by every image-slot placeholder in the
// homepage (Hero, Fabric, Workshop, Gallery, Testimonial) so they all read
// as one visual language instead of five one-off gradients. Swapping a
// placeholder for a real photo later only touches the placeholder
// component that wraps this, never the sections that render it.
export function LuxuryGradientField({ variant = 'a', className = '' }: { variant?: 'a' | 'b' | 'c'; className?: string }) {
  // Walnut Atelier — recolored to the Walnut Brown + Warm Walnut + Smoked
  // Walnut + Deep Espresso system: warm walnut highlight fading to shadow
  // (a and b, differing only in radial origin), and (c) the Deep Espresso
  // -> Warm Walnut hand-off used at the bottom of the Hero, so FinalCta's
  // full-bleed close (itself luxury-navy-deep = Warm Walnut) reads
  // continuous with it rather than as a new background.
  const gradients: Record<string, string> = {
    a: 'radial-gradient(120% 120% at 15% 10%, #8B6245 0%, #5A3F30 45%, #221814 100%)',
    b: 'radial-gradient(110% 140% at 85% 90%, #8B6245 0%, #5A3F30 50%, #221814 100%)',
    c: 'linear-gradient(160deg, #221814 0%, #5A3F30 60%, #8B6245 100%)',
  }

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 animate-luxury-drift ${className}`}
      style={{ backgroundImage: gradients[variant] }}
    />
  )
}
