// Walnut Atelier — "Motif Material": a barely-visible vertical wood-grain
// texture felt across the whole page, not just one section. Implemented as
// a single fixed, full-viewport, pointer-events-none layer (rather than
// touching every luxury-navy-deep/-navy/-charcoal section individually,
// which would mean editing 25+ files) — one mount per page covers every
// section beneath it for the lifetime of the scroll. z-[3] deliberately
// sits above each section's own background/scrim layers (this codebase's
// convention is z-0/z-1/z-2 for those) but below actual content (z-10+),
// and below the fixed Nav (z-40) so the header stays fully crisp.
//
// Two layered repeating-linear-gradients, both vertical (90deg): a fine
// Deep Espresso hairline every 7px (the grain lines themselves) plus a
// wider, softer Warm Walnut band every 53px (a deliberately non-repeating-
// with-the-first-layer period, so the two never align into a moiré
// pattern) for a little organic figure variation. Combined opacity reads
// as ~4-5% — within the brief's 3-6% target, "hampir tidak terlihat, hanya
// terasa."
export function WalnutGrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[3] bg-[repeating-linear-gradient(90deg,rgba(34,24,20,0.05)_0px,rgba(34,24,20,0.05)_1px,transparent_1px,transparent_7px),repeating-linear-gradient(90deg,rgba(139,98,69,0.04)_0px,rgba(139,98,69,0.04)_2px,transparent_2px,transparent_53px)]"
    />
  )
}
