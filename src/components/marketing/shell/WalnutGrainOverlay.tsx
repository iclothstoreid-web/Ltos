// Walnut Atelier — "Motif Material": a real, organic walnut wood-grain
// texture (public/textures/walnut-grain.png — procedurally generated
// irregular vertical fiber + broad figure bands, Deep Espresso at ~5%
// peak alpha, seamlessly tileable) felt across the whole page, not just
// one section. Supersedes the earlier CSS repeating-linear-gradient
// version, which the brief flagged as reading as plain "lines" rather
// than wood. Implemented as a single fixed, full-viewport, pointer-
// events-none layer (rather than touching every luxury-navy-deep/-navy/
// -charcoal section individually) — one mount per page covers every
// section beneath it for the lifetime of the scroll. z-[3] deliberately
// sits above each section's own background/scrim layers (this codebase's
// convention is z-0/z-1/z-2 for those) but below actual content (z-10+),
// and below the fixed Nav (z-40) so the header stays fully crisp.
export function WalnutGrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[3]"
      style={{ backgroundImage: 'url(/textures/walnut-grain.png)', backgroundRepeat: 'repeat', backgroundSize: '512px 512px' }}
    />
  )
}
