import { Logo } from '@/components/brand/Logo'

// Pure brand identity — no dynamic props by design, so it can be reused
// as-is by every future milestone page without changes.
export function JourneyHero() {
  return (
    <header className="px-6 pt-10 pb-6 text-center border-b border-on-surface/10">
      {/* Brand System Upgrade — 1.8x the previous h-5/20px. */}
      <Logo variant="horizontal" className="mx-auto mb-2 h-9 w-auto text-secondary" />
      <p className="font-fraunces text-2xl text-on-surface">Customer Journey</p>
    </header>
  )
}
